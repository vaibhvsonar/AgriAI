# 📄 Code Explanation: `src/pages/ResultsPage.jsx`

**File:** `src/pages/ResultsPage.jsx`  
**Role:** Displays the full disease diagnosis after inference — confidence ring, top predictions, tabbed disease information, urgency rating, product recommendations, and report download.

---

## Architecture Overview

```
ResultsPage.jsx
│
├── ConfidenceRing       ← SVG animated circular gauge
├── PredictionBars       ← Top-5 probability horizontal bars
└── ResultsPage (main)
    ├── Reads from sessionStorage
    ├── Header (disease name + timestamp)
    ├── Left Column
    │   ├── DiseaseCard (image + metadata)
    │   ├── ConfidenceRing
    │   └── PredictionBars
    └── Right Column
        ├── [if Healthy] → HealthyPanel with care tips
        └── [if Diseased] →
            ├── CausesSection
            ├── InfoTabs (Symptoms / Treatment / Prevention)
            ├── UrgencyCard
            └── MarketplaceSection
```

---

## Section 1: `ConfidenceRing` Component

```jsx
function ConfidenceRing({ value }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius   // = 339.3px
  const offset = circumference * (1 - value)   // how much of the circle to hide
  const pct = Math.round(value * 100)

  const color = value >= 0.9 ? '#52b788'   // green
              : value >= 0.75 ? '#f4a261'  // orange
              : '#e63946'                   // red

  return (
    <div className="confidence-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track circle (background) */}
        <circle cx="70" cy="70" r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Progress circle */}
        <circle cx="70" cy="70" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="confidence-ring-center">
        <span style={{ color }}>{pct}%</span>
        <span>Confidence</span>
      </div>
    </div>
  )
}
```

**How the SVG ring works:**

The key trick is `strokeDasharray` + `strokeDashoffset`:

```
strokeDasharray  = circumference    → Makes the stroke one long dash equal to the full circle
strokeDashoffset = circumference × (1 - value)
                 → Shifts the dash forward, "hiding" the unfilled portion

Example: value = 0.94 (94%)
  circumference  = 339.3px
  offset         = 339.3 × (1 - 0.94) = 339.3 × 0.06 = 20.4px
  Result: 94% of the ring is visible, 6% is "hidden" (offset away)
```

**`transform="rotate(-90 70 70)"`:**
Without this, SVG circles start drawing from the 3 o'clock position (right side).
The -90° rotation shifts the start to 12 o'clock (top center) — the natural starting point for a gauge.

**Color thresholds:**
```
≥ 90% → Green  (#52b788) — "Very high confidence"
≥ 75% → Orange (#f4a261) — "Good confidence — verify visually"
< 75% → Red    (#e63946) — "Moderate — consult an expert"
```

**Glow effect:**
```css
filter: drop-shadow(0 0 8px #52b788)
```
Creates a colored glow around the arc matching the confidence color — a premium visual touch.

---

## Section 2: `PredictionBars` Component

```jsx
function PredictionBars({ predictions }) {
  return (
    <div className="pred-bars">
      {predictions.map((p, i) => (
        <div key={i} className="pred-bar-item">
          <div className="pred-bar-header">
            <span>{p.cls.label}</span>
            <span className="text-dim">({p.cls.crop})</span>
            <span>{(p.conf * 100).toFixed(1)}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill"
              style={{
                width: `${p.conf * 100}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, #2d6a4f, #52b788)'  // primary: green
                  : 'linear-gradient(90deg, rgba(82,183,136,0.3), rgba(82,183,136,0.5))',
                transition: `width ${0.5 + i * 0.1}s ease`,  // staggered animation
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Staggered animation:** Each bar has a slightly longer transition duration:
- Bar 1: `width 0.5s ease`
- Bar 2: `width 0.6s ease`
- Bar 3: `width 0.7s ease`
This creates a cascade effect where bars fill in sequence — a micro-animation that draws the eye.

**Primary vs runner-up styling:**
- `i === 0` → Solid green gradient (the main prediction)
- `i > 0` → Semi-transparent green (supporting predictions)

---

## Section 3: `ResultsPage` Main Component

### Data Reading

```jsx
useEffect(() => {
  const raw = sessionStorage.getItem('agriAI_result')
  const img = sessionStorage.getItem('agriAI_imageUrl')

  if (!raw) {
    navigate('/detect')  // No result? Redirect back
    return
  }

  const data = JSON.parse(raw)
  setResult(data)
  if (img) setImageUrl(img)

  setTimeout(() => setSavedHistory(true), 1500)  // simulate async save
}, [navigate])
```

**Guard clause:** `if (!raw) navigate('/detect')` — if someone navigates directly to `/results` with no data in sessionStorage (e.g., typed the URL manually), they're redirected back to the detect page.

**`savedHistory` simulation:**
```jsx
{savedHistory ? ' ✓ Saved to history' : ' Saving...'}
```
After 1.5 seconds, the "Saving..." status changes to "✓ Saved to history". This gives users confidence their scan was recorded, even though it was already saved synchronously in DetectPage.

---

### Severity Metadata

```jsx
const severityMeta = {
  Low:      { color: '#52b788', badge: 'badge-success', emoji: '🟢' },
  Moderate: { color: '#f4a261', badge: 'badge-warning', emoji: '🟡' },
  Severe:   { color: '#e63946', badge: 'badge-danger',  emoji: '🔴' },
}
const sev = severity ? severityMeta[severity] : null
```

Using an object lookup instead of if/else chains:
```js
// Instead of:
if (severity === 'Low') { color = '#52b788' }
else if (severity === 'Moderate') { color = '#f4a261' }

// Cleaner lookup:
const sev = severityMeta[severity]
sev.color  // '#52b788'
sev.badge  // 'badge-success'
```

---

### Report Download

```jsx
const handleDownload = () => {
  const report = `AgriAI Detection Report
========================
Date: ${new Date(result.timestamp).toLocaleString()}
Crop: ${primaryClass.crop}
Disease: ${isHealthy ? 'Healthy — No Disease Detected' : primaryClass.label}
Confidence: ${(confidence * 100).toFixed(1)}%

Symptoms:
${info.symptoms.map(s => `• ${s}`).join('\n')}

Treatments:
${info.treatments.map(t => `• ${t}`).join('\n')}
...
`
  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AgriAI_Report_${primaryClass.crop}_${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
```

**How browser file download works without a server:**
1. Build the report as a JavaScript string using template literals
2. `new Blob([report], { type: 'text/plain' })` — creates an in-memory file
3. `URL.createObjectURL(blob)` — gives the blob a temporary `blob:http://...` URL
4. Create an invisible `<a>` element, set `href` to the blob URL, set `download` filename
5. `.click()` programmatically triggers the download
6. `URL.revokeObjectURL(url)` — frees memory after download

---

### Tabbed Info Panel

```jsx
const [activeTab, setActiveTab] = useState('treatment')

// Tabs
['symptoms', 'treatment', 'prevention'].map(tab => (
  <button
    className={`info-tab ${activeTab === tab.key ? 'active' : ''}`}
    onClick={() => setActiveTab(tab.key)}
  >
    {tab.label}
  </button>
))

// Tab content
{activeTab === 'symptoms'  && <ul>{info.symptoms.map(s => <li>{s}</li>)}</ul>}
{activeTab === 'treatment' && <ul>{info.treatments.map(t => <li>{t}</li>)}</ul>}
{activeTab === 'prevention'&& <ul>{info.prevention.map(p => <li>{p}</li>)}</ul>}
```

**`useState('treatment')` as default:** The Treatment tab is shown first by default — this is what farmers need most urgently when a disease is detected.

---

### Urgency Card

```jsx
<div className={`urgency-card ${severity?.toLowerCase()}`}>
  <div className="urgency-icon">
    {severity === 'Severe' ? '🚨' : severity === 'Moderate' ? '⚠️' : 'ℹ️'}
  </div>
  <div>
    <div className="urgency-title">
      {severity === 'Severe'   ? 'Immediate Action Required'
     : severity === 'Moderate' ? 'Action Recommended Soon'
     :                           'Monitor & Treat When Convenient'}
    </div>
    <div className="urgency-desc">
      {severity === 'Severe'   ? 'Apply treatment within 24-48 hours to prevent total crop loss.'
     : severity === 'Moderate' ? 'Apply treatment within the next week during dry conditions.'
     :                           'Address within 2–3 weeks; monitor spread closely.'}
    </div>
  </div>
</div>
```

**`severity?.toLowerCase()`** — uses optional chaining (`?.`) to safely get the lowercase class name even if `severity` is null/undefined, avoiding a runtime error.

The CSS class name matches the severity: `urgency-card.severe`, `urgency-card.moderate`, `urgency-card.low` — each has different border colors and backgrounds.

---

### Healthy Plant Path

```jsx
if (isHealthy) {
  return (
    <div className="healthy-card">
      <div>🌿</div>
      <h2>Your Plant is Healthy!</h2>
      <div className="healthy-tips">
        {[
          '🔍 Continue weekly scouting of your crop',
          '💧 Maintain consistent irrigation and drainage',
          '🌱 Apply preventive fungicide sprays during humid periods',
          '✂️ Prune for good air circulation',
          '📋 Keep records of plant health over time',
        ].map(tip => <div key={tip}>{tip}</div>)}
      </div>
    </div>
  )
}
```

When `primaryClass.isHealthy === true`, the entire disease information panel is replaced with a congratulatory panel showing ongoing care tips. This prevents farmers from being alarmed unnecessarily.

---

## Data Flow Through This Component

```
sessionStorage['agriAI_result']  ─────┐
sessionStorage['agriAI_imageUrl'] ────┤
                                      ↓
                              useEffect() reads both
                                      ↓
                         result = { primaryClass, confidence,
                                    severity, topPredictions,
                                    info, timestamp, ... }
                                      ↓
                    ┌─────────────────────────────────┐
                    │         isHealthy?               │
                    ├─────────────────────────────────┤
                    │ Yes → HealthyPanel               │
                    │ No  → DiseaseCard                │
                    │       + ConfidenceRing           │
                    │       + PredictionBars           │
                    │       + InfoTabs                 │
                    │       + UrgencyCard              │
                    │       + Marketplace              │
                    └─────────────────────────────────┘
```
