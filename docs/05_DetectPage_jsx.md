# 📄 Code Explanation: `src/pages/DetectPage.jsx`

**File:** `src/pages/DetectPage.jsx`  
**Role:** The core feature page — handles image upload, runs the multi-signal AI analysis pipeline, shows a live analysis preview, and navigates to the results page.

This is the **largest and most complex file** in the project (~942 lines). It is broken into 5 major sections.

---

## Architecture Overview

```
DetectPage.jsx
│
├── SECTION 1: rgbToHsv()              ← Math utility
├── SECTION 2: analyzeImageColors()    ← Core pixel analysis engine
├── SECTION 3: DISEASE_GROUPS          ← Group definitions
├── SECTION 4: scoreAllGroups()        ← Multi-signal scoring
├── SECTION 5: runInference()          ← Final result orchestrator
├── SECTION 6: LiveAnalysisPreview     ← Real-time pre-inference UI
├── SECTION 7: SpatialHeatmap          ← 3×3 disease zone visualizer
├── SECTION 8: ProcessingOverlay       ← Loading animation
└── SECTION 9: DetectPage (main)       ← UI + upload handling
```

---

## Section 1: `rgbToHsv()` — Color Space Conversion

```js
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
```

**Why convert from RGB to HSV?**

| Color Model | Problem | 
|-------------|---------|
| RGB | `(200, 150, 50)` doesn't intuitively tell you "this is brown" |
| HSV | Hue=30°, Saturation=75%, Value=78% → clearly tells you "dark orange-brown" |

**Output fields:**
- **H (Hue):** 0–360 degrees on the color wheel. 0°=red, 60°=yellow, 120°=green, 240°=blue
- **S (Saturation):** 0–1, how vivid/gray the color is. 0=gray, 1=full color
- **V (Value/Brightness):** 0–1, how dark/bright. 0=black, 1=brightest

**Math breakdown:**
1. Normalize R, G, B from 0–255 to 0.0–1.0
2. `max` = brightest channel, `min` = darkest channel
3. `d = max - min` = chroma (how colorful)
4. **Saturation** = chroma / max (0 if completely gray)
5. **Value** = max (the brightest channel IS the brightness)
6. **Hue** = determined by which channel is max, and the ratio of the other two:
   - If Red is max → hue is between yellow and magenta
   - If Green is max → hue is between yellow and cyan
   - If Blue is max → hue is between cyan and magenta

---

## Section 2: `analyzeImageColors()` — The Core Pixel Pipeline

```js
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
      // ... pixel analysis loop
    }
    img.src = blobUrl
  })
}
```

**Step 1 — Load image via Canvas API:**
```
File Object → createObjectURL() → blob:http://localhost/uuid
                                           ↓
                                   new Image().src = blobUrl
                                           ↓
                                   img.onload fires
                                           ↓
                              Canvas (150×150) draws the image
                                           ↓
                              getImageData() → RGBA pixel array
```

**Why 150×150?**
- Full-resolution images (e.g., 4000×3000) would require analyzing 12 million pixels
- Downsampling to 150×150 = only 22,500 pixels → fast analysis (~100ms)
- At this scale, color distribution information is still accurately preserved

**The pixel loop:**
```js
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const i = (y * SIZE + x) * 4   // RGBA index (4 bytes per pixel)
    const r = data[i], g = data[i+1], b = data[i+2]   // Alpha (data[i+3]) ignored
    const { h, s, v } = rgbToHsv(r, g, b)
    // ... classify pixel
  }
}
```

**Color bin classification (Signal 1):**
```js
if (v > 0.88 && s < 0.12)                          bins.white++
else if (v > 0.45 && v <= 0.88 && s < 0.18)        bins.silver++
else if (h >= 65 && h <= 155 && s > 0.2 && v > 0.18) { bins.green++; isDiseased=false }
else if (h >= 42 && h < 65 && s > 0.28 && v > 0.3)  bins.yellow++
else if (h >= 15 && h < 42 && s > 0.22 && v < 0.72) bins.brown++
else if (h >= 5 && h < 20 && s > 0.42 && v > 0.38)  bins.orange++
else if ((h < 8 || h >= 345) && s > 0.38)            bins.red++
else if (v < 0.18)                                   bins.dark++
else if (h >= 258 && h < 322 && s > 0.18)            bins.purple++
```

Each condition corresponds to a visual disease symptom:
| Bin | HSV Rule | Disease Meaning |
|-----|----------|----------------|
| white | Very bright, near-gray | Powdery mildew coating |
| silver | Medium bright, low saturation | Mold, fungal haze |
| green | Hue 65°–155°, medium saturation | Healthy leaf tissue |
| yellow | Hue 42°–65° | Chlorosis, viral yellowing |
| brown | Hue 15°–42°, medium-dark | Fungal lesions, scorch |
| orange | Hue 5°–20°, vivid | Rust pustules |
| red | Near 0°/360°, vivid | Bacterial rot, canker |
| dark | Very low brightness | Necrosis, late blight |
| purple | Hue 258°–322° | Downy mildew |

**Signal 2 — Spatial Zone Mapping:**
```js
const ZONES = 3, zoneSize = SIZE / ZONES  // 50px per zone
const zoneDisease = Array.from({ length: 3 }, () => new Float32Array(3))
const zoneTotal   = Array.from({ length: 3 }, () => new Float32Array(3))

const zx = Math.min(Math.floor(x / zoneSize), ZONES - 1)  // 0, 1, or 2
const zy = Math.min(Math.floor(y / zoneSize), ZONES - 1)
zoneTotal[zy][zx]++
if (isDiseased) zoneDisease[zy][zx]++
```

Creates a 3×3 disease density grid:
```
┌───────┬───────┬───────┐
│ [0][0]│ [0][1]│ [0][2]│  ← Edge row (top)
├───────┼───────┼───────┤
│ [1][0]│ [1][1]│ [1][2]│  ← Middle row (center at [1][1])
├───────┼───────┼───────┤
│ [2][0]│ [2][1]│ [2][2]│  ← Edge row (bottom)
└───────┴───────┴───────┘
```

**Signal 3 — Texture Variance:**
```js
brightnessSamples.push(v)
if (prevV >= 0 && Math.abs(v - prevV) > 0.22) transitions++
prevV = v
```
- Tracks every pixel's brightness value
- Counts rapid brightness changes (transitions) — high count = many small spots

**Derived Signals (computed after the loop):**
```js
const meanV = brightnessSamples.reduce((a, b) => a + b, 0) / brightnessSamples.length
const variance = brightnessSamples.reduce((a, v) => a + (v - meanV)**2, 0) / brightnessSamples.length
const transitionRate = transitions / total

const edgeDiseaseRatio   = mean of 8 perimeter zones
const centerDiseaseRatio = zoneDisease[1][1] / zoneTotal[1][1]

const uniform     = variance < 0.018          // powdery coating
const spotty      = variance > 0.042 && transitionRate > 0.14
const mosaic      = 0.022 < variance < 0.055
const edgeHeavy   = edgeDiseaseRatio > centerDiseaseRatio * 1.3
const centerHeavy = centerDiseaseRatio > edgeDiseaseRatio * 1.2
```

---

## Section 3: `DISEASE_GROUPS` — Group Definitions

```js
const DISEASE_GROUPS = {
  powderyMildew: {
    classes: ['Cherry___Powdery_mildew', 'Squash___Powdery_mildew'],
    label: 'Powdery Mildew', icon: '🍄', color: '#e0e0e0',
    description: 'White chalky fungal coating detected on leaf surface',
  },
  // 6 more groups...
}
```

**Purpose:** Groups related disease classes together so the scoring engine can work at a higher level of abstraction. Instead of scoring 38 individual classes, it scores 7 groups, then picks from the winning group's class list.

---

## Section 4: `scoreAllGroups()` — Multi-Signal Scoring

```js
function scoreAllGroups(c) {
  const s = {
    powderyMildew:
      c.white  * 15 +
      c.silver * 10 +
      (c.uniform   ? 8  : -3) +
      (c.spotty    ? -8 : 2)  +
      c.brown  * -5 +
      c.dark   * -9 + ...
    // ...
  }

  const ranked = Object.entries(s).sort((a, b) => b[1] - a[1])
  const winner = ranked[0].score > 0.8 ? ranked[0].group : null
  // ...
  return { winner, ranked, reasoning }
}
```

**Scoring Logic:**
- Positive weights → signals that CONFIRM this disease group
- Negative weights → signals that CONTRADICT this disease group
- The weight magnitudes reflect confidence: `orange * 15` for Rust (very strong signal), `brown * 3` for Rust (supporting signal)

**Example: Rust scoring**
```
c.orange = 0.12 → 0.12 × 15 = 1.8 (strong positive)
c.spotty = true → +7 (pustules are spotty)
c.dark   = 0.05 → 0.05 × -5 = -0.25 (slight negative)
Total rust score ≈ 8.55 (winner)
```

**Reasoning tokens generation:**
```js
if (c.white  > 0.05) reasoning.push({ icon: '⬜', text: `White coating detected (${(c.white*100).toFixed(1)}%)` })
if (c.brown  > 0.06) reasoning.push({ icon: '🟫', text: `Brown lesions (${(c.brown*100).toFixed(1)}%)` })
```
These become the human-readable chips displayed in the Live Analysis Preview.

---

## Section 5: `runInference()` — Orchestrator

```js
async function runInference(file) {
  const colors  = await analyzeImageColors(file)
  const { winner, ranked, reasoning } = scoreAllGroups(colors)

  // Select primary disease from winning group
  let candidatePool = diseasedClasses
  if (winner && DISEASE_GROUPS[winner]) {
    const groupClasses = diseasedClasses.filter(c => DISEASE_GROUPS[winner].classes.includes(c.name))
    if (groupClasses.length > 0) candidatePool = groupClasses
  }
  const primary = candidatePool[Math.floor(Math.random() * candidatePool.length)]

  // Confidence calculation
  const margin  = ranked[0].score - ranked[1].score
  const baseConf = winner
    ? Math.min(0.78 + (margin / 25) * 0.18 + Math.random() * 0.04, 0.98)
    : 0.68 + Math.random() * 0.12

  // Build top-5 predictions with realistic distribution
  const others = runnerUps.map((cls, i) => ({
    cls, conf: remaining * weights[i] * (0.85 + Math.random() * 0.15)
  }))

  return {
    primaryClass: primary,
    confidence: baseConf,
    severity: ['Low', 'Moderate', 'Severe'][Math.floor(Math.random() * 3)],
    topPredictions: [{ cls: primary, conf: baseConf }, ...normalized],
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
```

**What it returns — the Result Object:**
| Field | Description |
|-------|-------------|
| `primaryClass` | The selected disease/healthy class object |
| `confidence` | Float 0.0–1.0 (e.g., 0.94) |
| `severity` | Random Low/Moderate/Severe assignment |
| `topPredictions` | Array of 5 `{cls, conf}` objects |
| `detectedGroup` | Winning group key (e.g., 'rust') |
| `groupInfo` | Group metadata (label, icon, color, description) |
| `groupScores` | Ranked array of all 7 group scores |
| `reasoning` | Human-readable signal tokens |
| `colorSignature` | Raw feature vector from analyzeImageColors |
| `info` | Knowledge base entry (symptoms, treatment, prevention) |
| `imageUrl` | Blob URL for displaying the uploaded image |
| `timestamp` | ISO string of when inference ran |

---

## Section 6: `LiveAnalysisPreview` Component

```jsx
function LiveAnalysisPreview({ file }) {
  const [colors, setColors] = useState(null)
  const [scored, setScored] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!file) return
    analyzeImageColors(file).then(c => {
      setColors(c)
      setScored(scoreAllGroups(c))
      setLoading(false)
    })
  }, [file])
  // ...render color bars, heatmap, suspected group...
}
```

**Key behavior:** Runs `analyzeImageColors()` immediately when an image is selected (BEFORE the user clicks "Analyze Now"). This gives instant visual feedback showing what the AI sees.

---

## Section 7: `SpatialHeatmap` Component

```jsx
function SpatialHeatmap({ colors }) {
  const { edgeDiseaseRatio, centerDiseaseRatio } = colors
  const zones = [
    edgeVal, edgeVal*0.9, edgeVal*1.1,
    edgeVal*0.8, centerVal, edgeVal*0.7,
    edgeVal*1.1, edgeVal*0.85, edgeVal*0.95,
  ].map(v => Math.min(v, 1))

  return (
    <div className="lap-heatmap">
      {zones.map((v, i) => {
        const alpha = 0.1 + (v / maxZ) * 0.75
        return (
          <div style={{ background: `rgba(230, 57, 70, ${alpha})` }} />
        )
      })}
    </div>
  )
}
```

Renders a 3×3 red-intensity grid. Higher alpha = more disease concentration in that zone. Reconstructs the zone data from the `edgeDiseaseRatio` and `centerDiseaseRatio` values.

---

## Section 8: `ProcessingOverlay` Component

```jsx
const PROCESSING_STEPS = [
  { label: 'Color & HSV analysis',       icon: '🎨' },
  { label: 'Spatial zone mapping',       icon: '🗺️' },
  { label: 'Texture & spot detection',   icon: '🔬' },
  { label: 'CNN disease classification', icon: '🧠' },
  { label: 'Knowledge base lookup',      icon: '📚' },
]

function ProcessingOverlay({ currentStep }) {
  // Steps show: done (✓), active (spinner), pending (icon)
}
```

**Visual States per step:**
- `i < currentStep` → green checkmark ✓
- `i === currentStep` → icon + spinning indicator (active)
- `i > currentStep` → just icon (pending)

---

## Section 9: Main `DetectPage` Component — Upload Flow

```jsx
export default function DetectPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleFile = useCallback((f) => {
    if (!ACCEPTED.includes(f.type)) { setError('Invalid type'); return }
    if (f.size > 15 * 1024 * 1024) { setError('Too large'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const handleAnalyze = async () => {
    setProcessing(true)
    const timer = setInterval(() => setCurrentStep(s => s + 1), 640)
    
    const [result] = await Promise.all([
      runInference(file),
      new Promise(r => setTimeout(r, 3500))  // minimum display time
    ])
    
    // Save scan to localStorage if logged in
    if (currentUser) { /* save scan */ }
    
    sessionStorage.setItem('agriAI_result', JSON.stringify(result))
    sessionStorage.setItem('agriAI_imageUrl', result.imageUrl)
    navigate('/results')
  }
}
```

**`Promise.all([runInference, 3.5s delay])`:**
- Waits for BOTH: inference completion AND 3.5 seconds
- If inference finishes in 0.5s, we still wait 3.5s total
- This ensures the user sees the full 5-step progress animation
- Creates a premium, trustworthy UX (instant results feel untrustworthy)

**Step timer:**
```js
const timer = setInterval(() => setCurrentStep(s => s + 1), 640)
```
Every 640ms, the overlay advances to the next step. 5 steps × 640ms = 3.2s of animation.

**Why sessionStorage for results?**
- Results are temporary — only needed for the current browsing session
- If the user opens a new tab, they should not see stale results
- Avoids polluting localStorage with image data
