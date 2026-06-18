# 📄 Code Explanation: `src/pages/DashboardPage.jsx`

**File:** `src/pages/DashboardPage.jsx`  
**Role:** Role-based analytics dashboard — shows different views for Farmers (scan history, farm map, weather alerts) and Experts (global analytics, pending review feed).

---

## Architecture Overview

```
DashboardPage.jsx
│
├── CustomTooltip              ← Recharts chart tooltip
│
├── [Expert Components]
│   ├── ExpertAnalytics        ← AreaChart + PieChart
│   └── PendingReviewsFeed     ← Review submission workflow
│
├── [Farmer Components]
│   ├── WeatherWidget          ← Simulated farm conditions + AI alerts
│   ├── FarmMap                ← Geospatial scan markers
│   └── PersonalHistory        ← Scan history table
│
└── DashboardPage (main)
    ├── Role detection (isExpert)
    ├── Summary cards × 4
    ├── Tab navigation (Farmer only)
    └── Conditional rendering by role
```

---

## Section 1: `CustomTooltip` — Chart Tooltip

```jsx
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}{p.name === 'accuracy' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}
```

Recharts passes these props to a custom tooltip:
- `active` — boolean, whether the cursor is near a data point
- `payload` — array of data values at the hovered point
- `label` — the X-axis label (e.g., 'W1')

The `p.name === 'accuracy' ? '%' : ''` adds a `%` suffix only for the accuracy chart.

---

## Section 2: `ExpertAnalytics` — Charts

```jsx
function ExpertAnalytics() {
  return (
    <div className="charts-grid">
      {/* Chart 1: Model Accuracy */}
      <div className="chart-card card">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA_ACCURACY}>
            <defs>
              <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#52b788" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#52b788" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: '#6b8f76', fontSize: 11 }} />
            <YAxis domain={[85, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="accuracy" stroke="#52b788"
              strokeWidth={2.5} fill="url(#accuracyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Disease Distribution */}
      <div className="chart-card card">
        <PieChart>
          <Pie data={CHART_DATA_DISEASES} innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value">
            {CHART_DATA_DISEASES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </div>
  )
}
```

**Recharts Components Used:**

| Component | Purpose |
|-----------|---------|
| `ResponsiveContainer` | Makes the chart fill available width — responsive to screen size |
| `AreaChart` | Line chart with filled area below — shows trend over time |
| `linearGradient` | SVG gradient: 30% opacity at top → 0% at bottom — creates the fade effect |
| `CartesianGrid` | Subtle grid lines at `rgba(255,255,255,0.04)` — barely visible on dark background |
| `XAxis / YAxis` | Axes with custom tick colors and `domain={[85,100]}` to zoom in on the 85–100 range |
| `Area` | The actual data curve — `type="monotone"` = smooth curve |
| `PieChart + Pie` | Donut chart — `innerRadius + outerRadius` creates the donut hole |
| `Cell` | Colors each pie slice individually using `entry.color` from the data |

**`domain={[85, 100]}` on YAxis:**  
Without this, the chart would show 0–100 and the accuracy line would look flat near the top. Zooming in to 85–100 makes the improvement from 89% → 94% visually impactful.

---

## Section 3: `PendingReviewsFeed` — Expert Review Workflow

```jsx
function PendingReviewsFeed({ globalScans, setGlobalScans }) {
  const pendingReviews = globalScans.filter(s => s.status === 'Pending Review')

  const handleResolve = (scanId, note) => {
    const updated = globalScans.map(scan => {
      if (scan.id === scanId) {
        return { ...scan, status: 'Reviewed', expertNote: note }
      }
      return scan
    })
    setGlobalScans(updated)
    localStorage.setItem('agriAI_global_scans', JSON.stringify(updated))
  }

  return (
    <div>
      {pendingReviews.map(scan => (
        <div key={scan.id} className="review-card">
          <p>Farmer {scan.farmerName} — Confidence: {Math.round(scan.confidence * 100)}%</p>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleResolve(scan.id, e.target.note.value)
          }}>
            <input type="text" name="note" placeholder="Add treatment advice..." required />
            <button type="submit">Submit Review</button>
          </form>
        </div>
      ))}
    </div>
  )
}
```

**`handleResolve` — Immutable state update:**
```js
const updated = globalScans.map(scan => {
  if (scan.id === scanId) {
    return { ...scan, status: 'Reviewed', expertNote: note }  // new object
  }
  return scan  // unchanged scans returned as-is
})
```
`map()` returns a new array — never mutates the original. `{ ...scan, status: 'Reviewed' }` uses spread operator to copy all properties and override only `status` and `expertNote`.

**Form input access:**
```js
e.target.note.value
```
`e.target` is the `<form>` element. Since the input has `name="note"`, it's accessible as `e.target.note.value`. This avoids needing a separate `useState` for the input value (no controlled component pattern needed for simple one-time submit forms).

---

## Section 4: `WeatherWidget` — AI Disease Risk Alerts

```jsx
function WeatherWidget() {
  const weatherData = {
    temp: 28,
    humidity: 82,
    moisture: 'Low',
    condition: '⛈️',
    forecast: 'Thunderstorms expected'
  }

  const alerts = []
  if (weatherData.humidity > 80 && weatherData.temp > 25) {
    alerts.push({
      type: 'danger',
      title: 'High Powdery Mildew Risk',
      desc: 'High humidity and warm temperatures create optimal conditions for fungal growth...',
      icon: '🍄'
    })
  }
  if (weatherData.moisture === 'Low') {
    alerts.push({
      type: 'warning',
      title: 'Drought Stress Warning',
      desc: 'Soil moisture is critically low. This increases susceptibility to Leaf Scorch...',
      icon: '🔥'
    })
  }
  // render weather card + alerts
}
```

**AI Rule Engine (simple if-then rules):**
```
IF humidity > 80% AND temp > 25°C
THEN → Powdery Mildew Risk (fungal conditions)

IF soil moisture = 'Low'
THEN → Drought Stress / Leaf Scorch Risk
```

This demonstrates how domain knowledge (agriculture) can be encoded as simple rules that drive meaningful, contextual recommendations.

---

## Section 5: `FarmMap` — Geospatial Visualization

```jsx
function FarmMap({ userScans }) {
  const mapScans = userScans.map((s, i) => {
    const seed = i * 137.5          // golden ratio approximation
    const x = 10 + (seed % 80)     // x: 10% – 90%
    const y = 10 + ((seed * 7) % 80) // y: 10% – 90%
    return { ...s, mapX: x, mapY: y }
  })

  return (
    <div className="farm-map-container">
      {mapScans.map(scan => {
        let color = '#52b788'
        if (scan.severity === 'Severe')   color = '#e63946'
        if (scan.severity === 'Moderate') color = '#f4a261'

        return (
          <div key={scan.id}
            className="farm-map-marker"
            style={{ left: `${scan.mapX}%`, top: `${scan.mapY}%`, backgroundColor: color }}
            title={`${scan.crop}: ${scan.disease}`}
          >
            <div className="farm-map-marker-pulse" style={{ borderColor: color }} />
          </div>
        )
      })}
    </div>
  )
}
```

**Stable pseudo-random positioning:**
```js
const seed = i * 137.5         // 0, 137.5, 275, 412.5...
const x = 10 + (seed % 80)    // Modulo gives repeating range 0–79
```

Why `137.5`? This is approximately the "golden angle" (137.508°). Using it as a multiplier distributes points evenly without clustering — the same mathematical principle used in sunflower seed arrangements.

**`% 80` ensures positions stay in the 10–90% range** (with the initial +10 offset), preventing markers from going to the very edge.

**Pulse animation:** The `.farm-map-marker-pulse` div creates a CSS ripple animation that grows outward from each marker — drawing attention to the scan locations.

---

## Section 6: `PersonalHistory` — Scan History Table

```jsx
function PersonalHistory({ userScans, requestReview }) {
  const severityBadge = (sev) => {
    if (!sev || sev === '—') return <span className="badge badge-success">Healthy</span>
    if (sev === 'Severe')    return <span className="badge badge-danger">Severe</span>
    if (sev === 'Moderate')  return <span className="badge badge-warning">Moderate</span>
    return <span className="badge badge-success">Low</span>
  }

  return (
    <table className="history-table">
      <tbody>
        {userScans.map(row => (
          <tr key={row.id}>
            <td>{new Date(row.date).toLocaleDateString()}</td>
            <td>{row.disease}</td>
            <td>
              <div className="conf-bar-fill" style={{ width: `${row.confidence * 100}%` }} />
              <span>{Math.round(row.confidence * 100)}%</span>
            </td>
            <td>{severityBadge(row.severity)}</td>
            <td>
              {statusBadge(row.status)}
              {row.expertNote && <div>"{row.expertNote}"</div>}
            </td>
            <td>
              {row.status === 'Monitoring' && (
                <button onClick={() => requestReview(row.id)}>Ask Expert</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

**`new Date(row.date).toLocaleDateString()`** — Converts ISO date string to locale-formatted date:
- `"2026-06-17T14:30:00.000Z"` → `"6/17/2026"` (US) or `"17/06/2026"` (UK)

**Conditional "Ask Expert" button:**
```jsx
{row.status === 'Monitoring' && <button>Ask Expert</button>}
```
The button only appears for scans with `Monitoring` status. Once a review is requested (status becomes `Pending Review`) or completed (`Reviewed`), the button disappears.

---

## Section 7: Main `DashboardPage` Component

### Role Detection & Data Loading

```jsx
export default function DashboardPage() {
  const { currentUser } = useAuth()
  const [globalScans, setGlobalScans] = useState([])
  const [userScans,   setUserScans]   = useState([])

  useEffect(() => {
    const scans = JSON.parse(localStorage.getItem('agriAI_global_scans')) || []
    setGlobalScans(scans)
    setUserScans(scans.filter(s => s.userId === currentUser.id))
  }, [currentUser.id])

  const isExpert = currentUser?.role === 'expert'
```

**Filtering logic:**
- `globalScans` = ALL scans from ALL users (experts see this)
- `userScans` = only scans where `userId === currentUser.id` (farmers see only their own)

### Summary Cards Calculation

```jsx
const scansToUse = isExpert ? globalScans : userScans
const numScans   = scansToUse.length
const numSevere  = scansToUse.filter(s => s.severity === 'Severe').length
const avgConf    = numScans > 0
  ? (scansToUse.reduce((s, d) => s + d.confidence, 0) / numScans) * 100 : 0
const numHealthy = scansToUse.filter(s =>
  s.disease.includes('healthy') || s.disease === 'Healthy').length

// Financial Impact
const financialImpact = (numSevere * 450) + ((numScans - numSevere - numHealthy) * 120)
```

**`reduce()` for average confidence:**
```js
scansToUse.reduce((sum, scan) => sum + scan.confidence, 0) / numScans
// Accumulates: 0 → 0.94 → 0.94+0.88 → ... → total / count = average
```

**Financial impact formula:**
- Each severe case → estimated $450 in potential crop value protected by early detection
- Each moderate/low case → estimated $120
- This gives farmers a dollar-value motivation to use the platform

### Tab Navigation (Farmer Only)

```jsx
const [activeTab, setActiveTab] = useState('overview')

{!isExpert && (
  <div className="dashboard-tabs">
    <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
      onClick={() => setActiveTab('overview')}>
      🌦️ Overview & Alerts
    </button>
    <button className={`tab ${activeTab === 'map' ? 'active' : ''}`}
      onClick={() => setActiveTab('map')}>
      🗺️ Farm Map
    </button>
    <button className={`tab ${activeTab === 'history' ? 'active' : ''}`}
      onClick={() => setActiveTab('history')}>
      📋 Scan History
    </button>
  </div>
)}
```

Tab switching uses a single `activeTab` state string. The conditional rendering below decides what to show:
```jsx
{activeTab === 'overview' && <WeatherWidget />}
{activeTab === 'map'      && <FarmMap userScans={userScans} />}
{activeTab === 'history'  && <PersonalHistory ... />}
```

### Role-Based Rendering

```jsx
{isExpert ? (
  <>
    <ExpertAnalytics />
    <PendingReviewsFeed globalScans={globalScans} setGlobalScans={setGlobalScans} />
  </>
) : (
  <div className="dashboard-tab-content">
    {/* Tab-driven farmer content */}
  </div>
)}
```

**Why pass `setGlobalScans` to `PendingReviewsFeed`?**  
When an expert submits a review, the scan status changes. This change needs to be reflected in the parent's `globalScans` state so the `PendingReviewsFeed` list updates immediately (the resolved scan disappears). Passing the setter "lifts state" correctly.

---

## State Management Summary

```
DashboardPage state:
├── globalScans[]     ← all scans from localStorage (shared)
├── userScans[]       ← filtered: only current user's scans
└── activeTab         ← 'overview' | 'map' | 'history'

Derived values (computed, not stored):
├── isExpert         ← currentUser.role === 'expert'
├── numScans         ← scansToUse.length
├── numSevere        ← filter Severe
├── numHealthy       ← filter Healthy
└── financialImpact  ← formula

Data sources:
└── localStorage['agriAI_global_scans'] ← written by DetectPage, read here
```
