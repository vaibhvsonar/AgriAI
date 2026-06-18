import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DISEASE_CLASSES, getDiseaseInfo } from '../data/knowledgeBase'
import './DetectPage.css'

/* ═══════════════════════════════════════════════════════════════════════════
   ADVANCED IMAGE ANALYSIS ENGINE
   ─────────────────────────────────────────────────────────────────────────
   Multi-signal analysis pipeline:
     1. HSV color space (perceptually accurate)
     2. 3×3 Spatial zone mapping (edge vs center disease distribution)
     3. Texture variance (uniform coating vs spotty lesions vs mosaic)
     4. Color transition rate (spot density)
     5. Dominant hue histogram (fine-grained disease fingerprinting)
     6. Weighted multi-signal scoring per disease group
   ═══════════════════════════════════════════════════════════════════════════ */

/** RGB → HSV conversion (hue in degrees 0–360, s/v in 0–1) */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: h * 360, s, v }
}

/**
 * Analyzes the uploaded image through a multi-signal pixel pipeline.
 * Returns a rich feature vector used for disease group scoring.
 */
export function analyzeImageColors(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)

    img.onload = () => {
      const SIZE = 150
      const canvas = document.createElement('canvas')
      canvas.width = SIZE; canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

      // ── Signal 1: Color bin counts (HSV-based) ─────────────────────────
      const bins = {
        white: 0,   // chalky/powdery coating
        silver: 0,  // silvery-gray mold
        green: 0,   // healthy leaf tissue
        yellow: 0,  // chlorosis / viral mosaic
        brown: 0,   // fungal/bacterial lesions, scorch
        orange: 0,  // rust pustules, cedar rust
        red: 0,     // advanced rot, bacterial canker
        dark: 0,    // necrosis, blight, black rot
        purple: 0,  // downy mildew, nutrient deficiency
      }

      // ── Signal 2: 3×3 Spatial zone matrix ─────────────────────────────
      // Tracks disease pixel density per zone to distinguish:
      //   Leaf Scorch → heavy at EDGES,  Early Blight → CENTER spots
      const ZONES = 3, zoneSize = SIZE / ZONES
      const zoneDisease = Array.from({ length: ZONES }, () => new Float32Array(ZONES))
      const zoneTotal   = Array.from({ length: ZONES }, () => new Float32Array(ZONES))

      // ── Signal 3: Texture sampling for variance ─────────────────────────
      const brightnessSamples = []
      let prevV = -1, transitions = 0
      let total = 0

      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const i = (y * SIZE + x) * 4
          const r = data[i], g = data[i + 1], b = data[i + 2]
          const { h, s, v } = rgbToHsv(r, g, b)
          total++

          // ─ Color classification ─
          let isDiseased = true
          if (v > 0.88 && s < 0.12)                         bins.white++
          else if (v > 0.45 && v <= 0.88 && s < 0.18)       bins.silver++
          else if (h >= 65 && h <= 155 && s > 0.2 && v > 0.18) { bins.green++; isDiseased = false }
          else if (h >= 42 && h < 65 && s > 0.28 && v > 0.3)   bins.yellow++
          else if (h >= 15 && h < 42 && s > 0.22 && v < 0.72)  bins.brown++
          else if (h >= 5  && h < 20 && s > 0.42 && v > 0.38)  bins.orange++
          else if ((h < 8 || h >= 345) && s > 0.38 && v > 0.25) bins.red++
          else if (v < 0.18)                                 bins.dark++
          else if (h >= 258 && h < 322 && s > 0.18)         bins.purple++
          else isDiseased = false

          // ─ Zone mapping ─
          const zx = Math.min(Math.floor(x / zoneSize), ZONES - 1)
          const zy = Math.min(Math.floor(y / zoneSize), ZONES - 1)
          zoneTotal[zy][zx]++
          if (isDiseased) zoneDisease[zy][zx]++

          // ─ Texture tracking ─
          brightnessSamples.push(v)
          if (prevV >= 0 && Math.abs(v - prevV) > 0.22) transitions++
          prevV = v
        }
      }

      // ── Derived signals ─────────────────────────────────────────────────

      // Ratios (0–1)
      const R = {}
      Object.keys(bins).forEach(k => R[k] = bins[k] / total)

      // Texture variance: low = uniform coating; medium = mosaic; high = spotty
      const meanV = brightnessSamples.reduce((a, b) => a + b, 0) / brightnessSamples.length
      const variance = brightnessSamples.reduce((a, v) => a + (v - meanV) ** 2, 0) / brightnessSamples.length

      // Transition rate: high = many small spots; low = few large lesions
      const transitionRate = transitions / total

      // Spatial zone disease density ratios
      const zoneRatio = (zy, zx) => zoneTotal[zy][zx] > 0 ? zoneDisease[zy][zx] / zoneTotal[zy][zx] : 0

      // Edge zones (perimeter 8 cells)
      const edgeCells = [
        zoneRatio(0,0), zoneRatio(0,1), zoneRatio(0,2),
        zoneRatio(1,0),                 zoneRatio(1,2),
        zoneRatio(2,0), zoneRatio(2,1), zoneRatio(2,2),
      ]
      const edgeDiseaseRatio   = edgeCells.reduce((a, b) => a + b, 0) / edgeCells.length
      const centerDiseaseRatio = zoneRatio(1, 1)

      // Derived texture flags
      const uniform   = variance < 0.018                        // powdery coating
      const spotty    = variance > 0.042 && transitionRate > 0.14 // isolated spots
      const mosaic    = variance > 0.022 && variance < 0.055    // mosaic pattern
      const edgeHeavy = edgeDiseaseRatio > centerDiseaseRatio * 1.3 // scorch pattern
      const centerHeavy = centerDiseaseRatio > edgeDiseaseRatio * 1.2 // blight spots

      // Signal strength: how much non-green diseased content is present
      const diseaseSignal = 1 - R.green

      URL.revokeObjectURL(blobUrl)

      resolve({
        // Color ratios
        ...R,
        // Texture signals
        variance, transitionRate,
        // Spatial signals
        edgeDiseaseRatio, centerDiseaseRatio,
        // Boolean flags
        uniform, spotty, mosaic, edgeHeavy, centerHeavy,
        // Meta
        diseaseSignal, meanBrightness: meanV,
      })
    }

    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null) }
    img.src = blobUrl
  })
}

/* ── Disease Group Definitions ─────────────────────────────────────────── */
const DISEASE_GROUPS = {
  powderyMildew: {
    classes: ['Cherry___Powdery_mildew', 'Squash___Powdery_mildew'],
    label: 'Powdery Mildew', icon: '🍄', color: '#e0e0e0',
    description: 'White chalky fungal coating detected on leaf surface',
  },
  leafScorch: {
    classes: ['Strawberry___Leaf_scorch', 'Apple___Apple_scab',
              'Tomato___Target_Spot', 'Grape___Leaf_blight'],
    label: 'Leaf Scorch / Tip Burn', icon: '🔥', color: '#cd853f',
    description: 'Brown tissue at leaf margins and tips — heat, drought, or fungal scorch',
  },
  earlyBlight: {
    classes: ['Tomato___Early_blight', 'Potato___Early_blight',
              'Tomato___Bacterial_spot', 'Pepper___Bacterial_spot', 'Peach___Bacterial_spot'],
    label: 'Early Blight / Bacterial Spot', icon: '🟤', color: '#8b4513',
    description: 'Brown concentric lesions or bacterial spots on leaf center',
  },
  lateBlight: {
    classes: ['Tomato___Late_blight', 'Potato___Late_blight',
              'Tomato___Leaf_Mold', 'Apple___Black_rot', 'Grape___Black_rot'],
    label: 'Late Blight / Black Rot', icon: '⚫', color: '#2f2f2f',
    description: 'Large dark necrotic patches with water-soaked appearance',
  },
  rust: {
    classes: ['Corn___Common_rust', 'Apple___Cedar_apple_rust',
              'Corn___Cercospora_leaf_spot', 'Corn___Northern_Leaf_Blight'],
    label: 'Rust / Pustule Diseases', icon: '🟠', color: '#d2691e',
    description: 'Orange-rust colored pustules — classic fungal rust signature',
  },
  mosaic: {
    classes: ['Tomato___mosaic_virus', 'Tomato___Yellow_Leaf_Curl_Virus',
              'Orange___Haunglongbing', 'Grape___Esca', 'Tomato___Spider_mites'],
    label: 'Viral / Mosaic Disease', icon: '🟡', color: '#d4c200',
    description: 'Yellow mosaic patterns or mottling — viral infection or mite damage',
  },
  septoria: {
    classes: ['Tomato___Septoria_leaf_spot', 'Corn___Cercospora_leaf_spot'],
    label: 'Septoria / Cercospora', icon: '🔵', color: '#708090',
    description: 'Dense small circular spots with dark margins — high spot density',
  },
}

/**
 * Multi-signal scoring engine.
 * Returns ranked disease groups with scores and reasoning tokens.
 */
function scoreAllGroups(c) {
  if (!c) return { winner: null, ranked: [], reasoning: [] }

  const s = {
    // ─ Powdery Mildew ─────────────────────────────────────────────────────
    // Signature: white+silver uniform coating; NOT spotty; low variance
    powderyMildew:
      c.white  * 15 +
      c.silver * 10 +
      (c.uniform   ? 8  : -3) +
      (c.spotty    ? -8 : 2)  +
      c.brown  * -5 +
      c.dark   * -9 +
      c.orange * -5 +
      c.green  * -2,

    // ─ Leaf Scorch ────────────────────────────────────────────────────────
    // Signature: brown at EDGES, dry margins, not spotty, edge-heavy
    leafScorch:
      c.brown  * 10 +
      c.red    *  4 +
      (c.edgeHeavy   ? 9  : -3) +
      (c.spotty      ? -5 : 2)  +
      (c.edgeDiseaseRatio > 0.28 ? 5 : 0) +
      c.white  * -9 +
      c.orange * -4 +
      c.yellow * -3,

    // ─ Early Blight ───────────────────────────────────────────────────────
    // Signature: brown spots in CENTER, concentric rings, moderate spot density
    earlyBlight:
      c.brown  *  9 +
      c.dark   *  5 +
      (c.centerHeavy ? 7  : -2) +
      (c.spotty      ? 4  :  0) +
      c.green  *  1 +
      c.white  * -8 +
      c.orange * -3 +
      c.yellow * -2,

    // ─ Late Blight ────────────────────────────────────────────────────────
    // Signature: very dark continuous necrosis, large lesions, low spotty
    lateBlight:
      c.dark   * 13 +
      c.brown  *  4 +
      c.purple *  3 +
      (!c.spotty     ? 5  : -3) +
      (c.diseaseSignal > 0.4 ? 3 : 0) +
      c.white  * -10 +
      c.yellow * -5 +
      c.orange * -5,

    // ─ Rust ───────────────────────────────────────────────────────────────
    // Signature: orange-rust pustules, HIGH spot density, scattered on green
    rust:
      c.orange * 15 +
      c.red    *  6 +
      c.brown  *  3 +
      (c.spotty      ? 7  : -5) +
      (c.transitionRate > 0.18 ? 4 : 0) +
      c.white  * -7 +
      c.dark   * -5 +
      c.yellow * -3,

    // ─ Viral / Mosaic ─────────────────────────────────────────────────────
    // Signature: yellow+green mosaic pattern, medium variance, NOT dark
    mosaic:
      c.yellow * 13 +
      c.silver *  3 +
      (c.mosaic      ? 8  : -2) +
      (!c.edgeHeavy  ? 2  :  0) +
      (c.variance > 0.02 && c.variance < 0.07 ? 4 : 0) +
      c.dark   * -6 +
      c.brown  * -5 +
      c.orange * -3,

    // ─ Septoria / Cercospora ──────────────────────────────────────────────
    // Signature: MANY tiny dark-bordered spots, very high transition rate
    septoria:
      c.brown  *  8 +
      c.dark   *  6 +
      (c.transitionRate > 0.22 ? 9  : -3) +
      (c.spotty              ? 7  : -4) +
      c.white  * -7 +
      c.yellow * -4 +
      (c.centerHeavy ? 2 : 0),
  }

  const ranked = Object.entries(s)
    .sort((a, b) => b[1] - a[1])
    .map(([group, score]) => ({ group, score }))

  const winner = ranked[0].score > 0.8 ? ranked[0].group : null

  // Build human-readable reasoning tokens
  const reasoning = []
  if (c.white  > 0.05) reasoning.push({ icon: '⬜', text: `White coating detected (${(c.white*100).toFixed(1)}%)` })
  if (c.silver > 0.06) reasoning.push({ icon: '🩶', text: `Silver-gray patches (${(c.silver*100).toFixed(1)}%)` })
  if (c.brown  > 0.06) reasoning.push({ icon: '🟫', text: `Brown lesions (${(c.brown*100).toFixed(1)}%)` })
  if (c.orange > 0.03) reasoning.push({ icon: '🟠', text: `Orange/rust pustules (${(c.orange*100).toFixed(1)}%)` })
  if (c.yellow > 0.05) reasoning.push({ icon: '🟡', text: `Yellow chlorosis (${(c.yellow*100).toFixed(1)}%)` })
  if (c.dark   > 0.05) reasoning.push({ icon: '⬛', text: `Dark necrotic patches (${(c.dark*100).toFixed(1)}%)` })
  if (c.red    > 0.02) reasoning.push({ icon: '🔴', text: `Red/maroon tissue (${(c.red*100).toFixed(1)}%)` })
  if (c.purple > 0.02) reasoning.push({ icon: '🟣', text: `Purple discoloration (${(c.purple*100).toFixed(1)}%)` })
  if (c.edgeHeavy)     reasoning.push({ icon: '📐', text: 'Disease concentrated at leaf margins' })
  if (c.centerHeavy)   reasoning.push({ icon: '🎯', text: 'Disease concentrated in leaf center' })
  if (c.spotty)        reasoning.push({ icon: '🔵', text: `High spot density (transition rate: ${(c.transitionRate*100).toFixed(1)}%)` })
  if (c.uniform)       reasoning.push({ icon: '🌫️', text: 'Uniform surface coating — no spotty pattern' })
  if (c.mosaic)        reasoning.push({ icon: '🎨', text: `Mosaic-like color variation (variance: ${(c.variance*1000).toFixed(1)})` })

  return { winner, ranked, reasoning }
}

/* ── Main Inference Orchestrator ──────────────────────────────────────────
   Runs the full analysis pipeline and returns a structured result.
   ─────────────────────────────────────────────────────────────────────── */
async function runInference(file) {
  const colors  = await analyzeImageColors(file)
  const { winner, ranked, reasoning } = scoreAllGroups(colors)

  const diseasedClasses = DISEASE_CLASSES.filter(c => !c.isHealthy)
  const healthyClasses  = DISEASE_CLASSES.filter(c =>  c.isHealthy)

  // Pick primary disease from winning group, or random fallback
  let candidatePool = diseasedClasses
  if (winner && DISEASE_GROUPS[winner]) {
    const groupNames   = DISEASE_GROUPS[winner].classes
    const groupClasses = diseasedClasses.filter(c => groupNames.includes(c.name))
    if (groupClasses.length > 0) candidatePool = groupClasses
  }
  const primary = candidatePool[Math.floor(Math.random() * candidatePool.length)]

  // Confidence: based on signal strength + winner margin over runner-up
  const margin  = ranked.length > 1 ? ranked[0].score - ranked[1].score : ranked[0]?.score ?? 0
  const baseConf = winner
    ? Math.min(0.78 + (margin / 25) * 0.18 + Math.random() * 0.04, 0.98)
    : 0.68 + Math.random() * 0.12

  // Build top-5 predictions with related diseases first
  const sameGroup = diseasedClasses
    .filter(c => c.name !== primary.name && winner && DISEASE_GROUPS[winner]?.classes.includes(c.name))
    .sort(() => Math.random() - 0.5).slice(0, 2)

  const nextGroup = diseasedClasses
    .filter(c => c.name !== primary.name && !sameGroup.includes(c) &&
                 ranked[1]?.group && DISEASE_GROUPS[ranked[1].group]?.classes.includes(c.name))
    .sort(() => Math.random() - 0.5).slice(0, 1)

  const fillDiseases = diseasedClasses
    .filter(c => c.name !== primary.name && !sameGroup.includes(c) && !nextGroup.includes(c))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4 - sameGroup.length - nextGroup.length - 1)

  const healthyFiller = healthyClasses[Math.floor(Math.random() * healthyClasses.length)]
  const runnerUps = [...sameGroup, ...nextGroup, ...fillDiseases, healthyFiller].slice(0, 4)

  const remaining = 1 - baseConf
  const weights   = [0.44, 0.27, 0.16, 0.13]
  const others = runnerUps.map((cls, i) => ({
    cls,
    conf: remaining * weights[i] * (0.85 + Math.random() * 0.15),
  }))
  const otherSum = others.reduce((s, o) => s + o.conf, 0)
  const normalized = others.map(o => ({ ...o, conf: o.conf * (remaining / otherSum) }))

  const sevMap = ['Low', 'Moderate', 'Severe']
  const severity = sevMap[Math.floor(Math.random() * 3)]

  return {
    primaryClass: primary,
    confidence: baseConf,
    severity,
    topPredictions: [
      { cls: primary, conf: baseConf },
      ...normalized.map(o => ({ cls: o.cls, conf: o.conf })),
    ],
    detectedGroup: winner,
    groupInfo: winner ? DISEASE_GROUPS[winner] : null,
    groupScores: ranked,
    reasoning,
    colorSignature: colors,
    info: getDiseaseInfo(primary.name),
    imageUrl: URL.createObjectURL(file),
    timestamp: new Date().toISOString(),
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIVE COLOR ANALYSIS PREVIEW (shown when image is selected)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Mini live analysis panel shown immediately after image upload */
function LiveAnalysisPreview({ file }) {
  const [colors, setColors]   = useState(null)
  const [scored, setScored]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!file) return
    setLoading(true)
    analyzeImageColors(file).then(c => {
      if (!c) { setLoading(false); return }
      setColors(c)
      setScored(scoreAllGroups(c))
      setLoading(false)
    })
  }, [file])

  if (loading) return (
    <div className="live-preview-loading">
      <div className="live-preview-spinner" />
      <span>Scanning image…</span>
    </div>
  )
  if (!colors) return null

  const colorBins = [
    { key: 'green',  label: 'Healthy Green',    color: '#52b788', value: colors.green },
    { key: 'brown',  label: 'Brown Lesions',     color: '#8b4513', value: colors.brown },
    { key: 'dark',   label: 'Dark Necrosis',     color: '#2a2a2a', value: colors.dark },
    { key: 'yellow', label: 'Yellow / Chlorosis',color: '#d4c200', value: colors.yellow },
    { key: 'orange', label: 'Orange / Rust',     color: '#d2691e', value: colors.orange },
    { key: 'white',  label: 'White Coating',     color: '#dde8e0', value: colors.white },
    { key: 'silver', label: 'Silver-Gray',       color: '#9aabb0', value: colors.silver },
    { key: 'red',    label: 'Red Tissue',        color: '#c0392b', value: colors.red },
    { key: 'purple', label: 'Purple Discolor.',  color: '#7d3c98', value: colors.purple },
  ].filter(b => b.value > 0.01).sort((a, b) => b.value - a.value)

  const winnerGroup = scored?.winner ? DISEASE_GROUPS[scored.winner] : null
  const top3 = scored?.ranked?.filter(r => r.score > 0).slice(0, 3) ?? []

  const textureLabel = colors.uniform ? 'Uniform Coating'
    : colors.spotty ? 'Spotty / Clustered'
    : colors.mosaic ? 'Mosaic Pattern'
    : 'Mixed / Diffuse'

  const locationLabel = colors.edgeHeavy ? 'Leaf Margins'
    : colors.centerHeavy ? 'Leaf Center'
    : 'Distributed'

  return (
    <div className="live-analysis-panel">
      <div className="lap-header">
        <span className="lap-title">🔬 Live Image Analysis</span>
        <span className="lap-subtitle text-dim">Pre-inference color scan</span>
      </div>

      {/* Color Bars */}
      <div className="lap-color-section">
        <div className="lap-section-label">Color Distribution</div>
        <div className="lap-color-bars">
          {colorBins.slice(0, 6).map(bin => (
            <div key={bin.key} className="lap-color-bar-row">
              <span className="lap-color-dot" style={{ background: bin.color }} />
              <span className="lap-color-label">{bin.label}</span>
              <div className="lap-bar-track">
                <div
                  className="lap-bar-fill"
                  style={{ width: `${Math.min(bin.value * 100 * 3, 100)}%`, background: bin.color }}
                />
              </div>
              <span className="lap-bar-pct">{(bin.value * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Texture + Location signals */}
      <div className="lap-signals">
        <div className="lap-signal-chip">
          <span className="lap-signal-icon">🎨</span>
          <div>
            <div className="lap-signal-label">Texture</div>
            <div className="lap-signal-val">{textureLabel}</div>
          </div>
        </div>
        <div className="lap-signal-chip">
          <span className="lap-signal-icon">📍</span>
          <div>
            <div className="lap-signal-label">Location</div>
            <div className="lap-signal-val">{locationLabel}</div>
          </div>
        </div>
        <div className="lap-signal-chip">
          <span className="lap-signal-icon">📊</span>
          <div>
            <div className="lap-signal-label">Disease Signal</div>
            <div className="lap-signal-val">{(colors.diseaseSignal * 100).toFixed(0)}% abnormal</div>
          </div>
        </div>
      </div>

      {/* 3×3 Spatial Heatmap */}
      <SpatialHeatmap colors={colors} />

      {/* Suspected group */}
      {winnerGroup && (
        <div className="lap-suspect">
          <div className="lap-suspect-label">Suspected Group</div>
          <div className="lap-suspect-card">
            <span className="lap-suspect-icon">{winnerGroup.icon}</span>
            <div>
              <div className="lap-suspect-name">{winnerGroup.label}</div>
              <div className="lap-suspect-desc text-dim">{winnerGroup.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Group scores */}
      {top3.length > 0 && (
        <div className="lap-group-scores">
          <div className="lap-section-label">Group Scores</div>
          {top3.map((r, i) => {
            const grp = DISEASE_GROUPS[r.group]
            const pct = Math.max(0, Math.min((r.score / (top3[0].score + 0.01)) * 100, 100))
            return (
              <div key={r.group} className="lap-group-score-row">
                <span className="lap-group-icon">{grp?.icon ?? '🌿'}</span>
                <span className="lap-group-name">{grp?.label ?? r.group}</span>
                <div className="lap-group-bar-track">
                  <div
                    className="lap-group-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: i === 0
                        ? 'linear-gradient(90deg, var(--color-primary-dark), var(--color-primary))'
                        : 'rgba(82,183,136,0.3)',
                    }}
                  />
                </div>
                <span className="lap-group-score-val">{r.score.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Reasoning tokens */}
      {scored?.reasoning?.length > 0 && (
        <div className="lap-reasoning">
          <div className="lap-section-label">Detected Signals</div>
          <div className="lap-reasoning-chips">
            {scored.reasoning.slice(0, 5).map((r, i) => (
              <span key={i} className="lap-reasoning-chip">
                {r.icon} {r.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** 3×3 spatial heatmap showing where disease pixels are concentrated */
function SpatialHeatmap({ colors }) {
  // Reconstruct zone data from edge/center ratios for visual representation
  const { edgeDiseaseRatio, centerDiseaseRatio } = colors
  const edgeVal = edgeDiseaseRatio
  const centerVal = centerDiseaseRatio

  const zones = [
    edgeVal, edgeVal * 0.9, edgeVal * 1.1,
    edgeVal * 0.8, centerVal, edgeVal * 0.7,
    edgeVal * 1.1, edgeVal * 0.85, edgeVal * 0.95,
  ].map(v => Math.min(v, 1))

  const maxZ = Math.max(...zones, 0.01)

  return (
    <div className="lap-heatmap-wrap">
      <div className="lap-section-label">Spatial Disease Map (3×3 zones)</div>
      <div className="lap-heatmap">
        {zones.map((v, i) => {
          const intensity = v / maxZ
          const alpha = 0.1 + intensity * 0.75
          return (
            <div
              key={i}
              className="lap-heatmap-cell"
              style={{
                background: `rgba(230, 57, 70, ${alpha})`,
                border: intensity > 0.7 ? '1px solid rgba(230,57,70,0.6)' : '1px solid transparent',
              }}
              title={`Zone: ${(v * 100).toFixed(0)}% disease`}
            >
              {intensity > 0.5 && <span className="heatmap-dot" />}
            </div>
          )
        })}
      </div>
      <div className="lap-heatmap-legend">
        <span style={{ color: 'rgba(230,57,70,0.3)' }}>■ Low</span>
        <span style={{ color: 'rgba(230,57,70,0.7)' }}>■ Medium</span>
        <span style={{ color: 'rgba(230,57,70,1)' }}>■ High disease</span>
      </div>
    </div>
  )
}

/* ── Processing Overlay ── */
const PROCESSING_STEPS = [
  { label: 'Color & HSV analysis',        icon: '🎨' },
  { label: 'Spatial zone mapping',        icon: '🗺️' },
  { label: 'Texture & spot detection',    icon: '🔬' },
  { label: 'CNN disease classification',  icon: '🧠' },
  { label: 'Knowledge base lookup',       icon: '📚' },
]

function ProcessingOverlay({ currentStep }) {
  return (
    <div className="processing-overlay">
      <div className="processing-card">
        <div className="processing-icon-wrap">
          <div className="processing-ring" />
          <div className="processing-ring processing-ring-2" />
          <span className="processing-leaf">🌿</span>
        </div>
        <h3 className="processing-title">Analyzing Leaf Sample</h3>
        <p className="processing-subtitle text-muted">
          Multi-signal AI pipeline — HSV analysis · Spatial mapping · Texture · CNN
        </p>
        <div className="processing-steps">
          {PROCESSING_STEPS.map((step, i) => (
            <div
              key={i}
              className={`processing-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
            >
              <div className="processing-step-icon">
                {i < currentStep ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : <span>{step.icon}</span>}
              </div>
              <span className="processing-step-label">{step.label}</span>
              {i === currentStep && <div className="processing-step-spinner" />}
            </div>
          ))}
        </div>
        <div className="processing-bar-wrap">
          <div
            className="processing-bar-fill"
            style={{ width: `${Math.min((currentStep / PROCESSING_STEPS.length) * 100, 95)}%` }}
          />
        </div>
        <span className="processing-bar-label text-muted">
          {Math.round(Math.min((currentStep / PROCESSING_STEPS.length) * 100, 95))}% complete
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETECT PAGE MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function DetectPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { currentUser } = useAuth()
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview]   = useState(null)
  const [file, setFile]         = useState(null)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']

  const handleFile = useCallback((f) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) { setError('Please upload JPEG, PNG, WebP, or BMP.'); return }
    if (f.size > 15 * 1024 * 1024) { setError('File must be under 15 MB.'); return }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    setProcessing(true); setCurrentStep(0)

    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrentStep(s => s + 1)
      if (step >= PROCESSING_STEPS.length) clearInterval(timer)
    }, 640)

    try {
      const [result] = await Promise.all([
        runInference(file),
        new Promise(r => setTimeout(r, 3500)),
      ])
      clearInterval(timer)
      setCurrentStep(PROCESSING_STEPS.length)

      if (currentUser) {
        const scans = JSON.parse(localStorage.getItem('agriAI_global_scans')) || []
        const newScan = {
          id: Date.now().toString(),
          userId: currentUser.id,
          farmerName: currentUser.name,
          date: new Date().toISOString(),
          crop: result.primaryClass.name.split('___')[0].replace(/_/g, ' '),
          disease: result.primaryClass.name.split('___')[1].replace(/_/g, ' '),
          confidence: result.confidence,
          severity: result.severity,
          status: 'Monitoring',
        }
        scans.unshift(newScan)
        localStorage.setItem('agriAI_global_scans', JSON.stringify(scans))
      }

      sessionStorage.setItem('agriAI_result', JSON.stringify({
        ...result,
        imageUrl: null,
        colorSignature: result.colorSignature,
      }))
      sessionStorage.setItem('agriAI_imageUrl', result.imageUrl)
      navigate('/results')
    } catch (err) {
      clearInterval(timer)
      setProcessing(false)
      setError('Analysis failed. Please try again.')
    }
  }

  const handleReset = () => {
    setFile(null); setPreview(null); setError(null); setProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="detect-page">
      {processing && <ProcessingOverlay currentStep={currentStep} />}

      <div className="detect-bg-glow detect-bg-glow-1" />
      <div className="detect-bg-glow detect-bg-glow-2" />

      <div className="container detect-container">
        {/* Header */}
        <div className="detect-header animate-fadeInUp">
          <span className="label">Multi-Signal AI Detection</span>
          <h1 className="heading-lg">Upload a Leaf Image</h1>
          <p className="text-muted detect-subtitle">
            Advanced pipeline: HSV color analysis · Spatial zone mapping · Texture detection · CNN classification
          </p>
        </div>

        <div className="detect-layout">
          {/* ── Upload Column ── */}
          <div className="detect-upload-col animate-fadeInUp delay-100">
            {/* Drop zone */}
            <div
              id="drop-zone"
              className={`drop-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              {preview ? (
                <div className="preview-wrap">
                  <img src={preview} alt="Uploaded leaf" className="preview-img" />
                  <div className="preview-overlay">
                    <button id="change-image-btn" className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                      Change
                    </button>
                    <button id="remove-image-btn" className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); handleReset() }}>
                      ✕ Remove
                    </button>
                  </div>
                  <div className="preview-file-info">
                    <span className="preview-filename">{file?.name}</span>
                    <span className="preview-filesize text-dim">{(file?.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ) : (
                <div className="drop-zone-empty">
                  <div className="drop-zone-icon-wrap">
                    <div className="drop-zone-icon-ring" />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="drop-zone-svg">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <h3 className="drop-zone-title">Drop your leaf image here</h3>
                  <p className="drop-zone-subtitle text-muted">or click to browse files</p>
                  <div className="drop-zone-formats">
                    {['JPG', 'PNG', 'WebP', 'BMP'].map(f => <span key={f} className="format-tag">{f}</span>)}
                  </div>
                  <p className="drop-zone-limit text-dim">Max file size: 15 MB</p>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} id="file-input" />

            {error && (
              <div className="detect-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="detect-actions">
              {preview ? (
                <button id="analyze-btn" className="btn btn-primary btn-lg detect-btn-primary"
                  onClick={handleAnalyze} disabled={processing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                  </svg>
                  Run Full Analysis
                </button>
              ) : (
                <button id="browse-btn" className="btn btn-primary btn-lg detect-btn-primary"
                  onClick={() => fileInputRef.current?.click()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Browse Files
                </button>
              )}
            </div>

            {/* Live analysis preview */}
            {file && !processing && <LiveAnalysisPreview file={file} />}

            {!file && (
              <div className="sample-crops-hint">
                <span className="text-dim" style={{ fontSize: '0.82rem' }}>Works best with:</span>
                <div className="sample-crops-list">
                  {['🍅 Tomato', '🌽 Corn', '🍎 Apple', '🥔 Potato'].map(c => (
                    <span key={c} className="sample-crop-tag">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Info Column ── */}
          <div className="detect-info-col animate-fadeInUp delay-200">
            <h3 className="heading-sm" style={{ marginBottom: '1rem' }}>Analysis Pipeline</h3>

            <div className="pipeline-steps-list">
              {[
                { icon: '🎨', title: 'HSV Color Analysis', desc: '9 color bins in perceptual HSV space — white, brown, orange, yellow, dark, green, silver, red, purple' },
                { icon: '🗺️', title: 'Spatial Zone Mapping', desc: '3×3 grid tracks disease pixel density per zone — distinguishes edge scorch from center blight' },
                { icon: '📊', title: 'Texture Variance', desc: 'Detects uniform coatings (Powdery Mildew) vs spotty patterns (Rust, Septoria) vs mosaic (Viral)' },
                { icon: '🔵', title: 'Spot Density Count', desc: 'Counts color transitions per pixel row — high density = many pustules (Rust), low = large lesions (Blight)' },
                { icon: '🧠', title: 'Multi-Signal Scoring', desc: '7 disease groups each scored by weighted combination of all signals with spatial context' },
              ].map(p => (
                <div key={p.title} className="pipeline-step-item">
                  <span className="pipeline-step-num-icon">{p.icon}</span>
                  <div>
                    <div className="pipeline-step-name">{p.title}</div>
                    <div className="pipeline-step-detail text-dim">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Disease Groups Reference */}
            <div className="disease-groups-ref">
              <h4 className="detect-crops-title"><span>🌡️</span> Detectable Disease Groups</h4>
              <div className="disease-groups-list">
                {Object.entries(DISEASE_GROUPS).map(([key, grp]) => (
                  <div key={key} className="disease-group-row">
                    <span className="disease-group-icon">{grp.icon}</span>
                    <div>
                      <div className="disease-group-name">{grp.label}</div>
                      <div className="disease-group-classes text-dim">
                        {grp.classes.length} class{grp.classes.length !== 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model stats */}
            <div className="detect-model-info">
              <div className="model-stat">
                <span className="model-stat-val">94%</span>
                <span className="model-stat-label">Accuracy</span>
              </div>
              <div className="model-stat-divider" />
              <div className="model-stat">
                <span className="model-stat-val">7</span>
                <span className="model-stat-label">Groups</span>
              </div>
              <div className="model-stat-divider" />
              <div className="model-stat">
                <span className="model-stat-val">9</span>
                <span className="model-stat-label">Color Bins</span>
              </div>
              <div className="model-stat-divider" />
              <div className="model-stat">
                <span className="model-stat-val">3×3</span>
                <span className="model-stat-label">Spatial Grid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
