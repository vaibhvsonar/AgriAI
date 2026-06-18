# 📄 Code Explanation: `src/data/knowledgeBase.js`

**File:** `src/data/knowledgeBase.js`  
**Role:** The centralized data layer — all static data used across the app lives here. Acts as a structured JSON knowledge base, a disease registry, and a chart data source.

---

## File Structure Overview

```
knowledgeBase.js
│
├── DISEASE_CLASSES[]          ← 38 PlantVillage disease/healthy classes
├── DISEASE_KNOWLEDGE_BASE{}   ← Detailed info for key diseases
├── GENERIC_DISEASE_TEMPLATE{} ← Fallback for unlisted diseases
├── getDiseaseInfo()           ← Lookup function
├── STATS[]                    ← Landing page stat cards
├── CROPS[]                    ← 14 supported crop names
├── TESTIMONIALS[]             ← User review quotes
├── DETECTION_HISTORY[]        ← Sample scan records
├── CHART_DATA_ACCURACY[]      ← Weekly accuracy trend data
├── CHART_DATA_DISEASES[]      ← Disease distribution chart data
└── PIPELINE_STEPS[]           ← 8-step pipeline for Landing page
```

---

## Part 1: `DISEASE_CLASSES` Array

```js
export const DISEASE_CLASSES = [
  { id: 0, name: 'Apple___Apple_scab',      label: 'Apple Scab',  crop: 'Apple', isHealthy: false },
  { id: 1, name: 'Apple___Black_rot',        label: 'Apple Black Rot', crop: 'Apple', isHealthy: false },
  { id: 2, name: 'Apple___Cedar_apple_rust', label: 'Cedar Apple Rust', crop: 'Apple', isHealthy: false },
  { id: 3, name: 'Apple___healthy',          label: 'Healthy',    crop: 'Apple', isHealthy: true },
  // ... 34 more entries
]
```

**Fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `id` | number | Index matching the CNN model's output neuron (0–37) |
| `name` | string | PlantVillage dataset class name format (`Crop___Disease`) |
| `label` | string | Human-readable display name |
| `crop` | string | The crop species (Apple, Tomato, etc.) |
| `isHealthy` | boolean | Whether this class represents a healthy plant |

**Naming Convention:** The `name` field uses PlantVillage's exact format:
```
Apple___Apple_scab
│       │
│       └── Disease or "healthy"
└── Crop species
```
The triple underscore (`___`) separates crop from condition.

**Why `isHealthy`?**  
The Results page uses this to decide whether to show the disease panel or the healthy congratulations panel:
```jsx
const isHealthy = primaryClass.isHealthy
if (isHealthy) { /* show green healthy panel */ }
else { /* show treatment tabs */ }
```

**Usage in DetectPage:**
```js
const diseasedClasses = DISEASE_CLASSES.filter(c => !c.isHealthy)  // 24 classes
const healthyClasses  = DISEASE_CLASSES.filter(c =>  c.isHealthy)  // 14 classes
```

---

## Part 2: `DISEASE_KNOWLEDGE_BASE` Object

```js
export const DISEASE_KNOWLEDGE_BASE = {
  'Apple___Apple_scab': {
    severity: 'Moderate',
    symptoms: [
      'Olive-green or brown spots on leaves',
      'Velvety fungal growth on lower leaf surface',
      'Distorted, cracked fruit with scab lesions',
      'Early defoliation in severe cases',
    ],
    causes: 'Caused by the fungus Venturia inaequalis; spreads through wet, cool conditions in spring.',
    treatments: [
      'Apply fungicides (captan, mancozeb, or myclobutanil) at bud break',
      'Remove and destroy infected fallen leaves',
      'Ensure proper spacing for airflow',
      'Prune dense canopy to reduce moisture retention',
    ],
    prevention: [
      'Plant scab-resistant apple varieties',
      'Apply protective fungicide sprays in early spring',
      'Rake and compost or burn fallen leaves in autumn',
      'Maintain dry foliage through drip irrigation',
    ],
    economicImpact: 'Can reduce yield by 30–70% in severe outbreaks.',
  },
  // ... more diseases
}
```

**This is the "expert knowledge" layer.** The knowledge base contains:
- `severity` — Low / Moderate / Severe rating
- `symptoms` — Observable physical signs on the plant
- `causes` — Pathogen name, environmental conditions that favor spread
- `treatments` — Actionable chemical and cultural control methods
- `prevention` — Long-term strategies to prevent recurrence
- `economicImpact` — Financial significance for farmer decision-making

**Diseases with explicit entries:**
1. `Apple___Apple_scab`
2. `Tomato___Late_blight` — historically significant (caused the Irish Potato Famine)
3. `Tomato___Early_blight`
4. `Corn___Common_rust`
5. `Potato___Late_blight`

---

## Part 3: `GENERIC_DISEASE_TEMPLATE`

```js
export const GENERIC_DISEASE_TEMPLATE = {
  severity: 'Moderate',
  symptoms: [
    'Discoloration or spots on leaf surface',
    'Unusual growth patterns or texture changes',
    'Wilting or abnormal leaf curling',
    'Reduced plant vigor and stunted growth',
  ],
  causes: 'Fungal, bacterial, or viral pathogen; spread through air, water, or soil contact.',
  treatments: [
    'Apply appropriate fungicide or bactericide based on disease type',
    'Remove and destroy infected plant material',
    'Improve air circulation through proper pruning',
    'Consult a local agricultural extension officer',
  ],
  prevention: [
    'Practice crop rotation to break disease cycles',
    'Use certified disease-free seeds and transplants',
    'Ensure proper drainage and avoid water stress',
    'Apply preventative sprays during high-risk periods',
  ],
  economicImpact: 'Variable impact; early detection significantly reduces crop losses.',
}
```

**Purpose:** The knowledge base only has 5 explicitly documented diseases. The remaining 33 classes use this generic template as a safe fallback so the app never crashes or shows blank information.

---

## Part 4: `getDiseaseInfo()` Function

```js
export function getDiseaseInfo(className) {
  const explicit = DISEASE_KNOWLEDGE_BASE[className]
  if (explicit) return explicit
  return GENERIC_DISEASE_TEMPLATE
}
```

This is a simple lookup with graceful degradation:
1. Try to find explicit knowledge: `DISEASE_KNOWLEDGE_BASE['Apple___Apple_scab']`
2. If found → return it
3. If not found → return the generic template

**Called by:** `runInference()` in `DetectPage.jsx`
```js
info: getDiseaseInfo(primary.name)
// e.g. getDiseaseInfo('Tomato___Late_blight') → detailed info
// e.g. getDiseaseInfo('Grape___Esca') → generic template
```

---

## Part 5: `STATS` — Landing Page Stat Cards

```js
export const STATS = [
  { value: 94,    suffix: '%', label: 'Validation Accuracy', desc: 'CNN model on PlantVillage dataset' },
  { value: 38,    suffix: '',  label: 'Disease Classes',     desc: 'Across 14 crop species' },
  { value: 54000, suffix: '+', label: 'Training Images',     desc: 'High-quality leaf photographs' },
  { value: 2,     suffix: 's', label: 'Inference Time',      desc: 'Average per image prediction' },
]
```

Used by `StatsSection` in `LandingPage.jsx` to render animated counters:
```jsx
<AnimatedCounter target={s.value} suffix={s.suffix} />
// Counts from 0 → 94 with easing animation when scrolled into view
```

---

## Part 6: `CROPS` — Supported Crop List

```js
export const CROPS = [
  'Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Pepper',
  'Cherry', 'Peach', 'Strawberry', 'Squash', 'Soybean',
  'Raspberry', 'Blueberry', 'Orange',
]
```

Used by:
1. **Landing Page — `CropsTicker`:** Creates a horizontal scrolling marquee by duplicating the array: `[...CROPS, ...CROPS]`
2. **Footer:** Displays the list of supported crops

---

## Part 7: `TESTIMONIALS` — Social Proof Data

```js
export const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Tomato Farmer, Maharashtra',
    text: 'AgriAI identified late blight...',
    rating: 5,
    avatar: 'RK',   // initials for avatar placeholder
    crop: 'Tomato',
  },
  // ...
]
```

**`avatar: 'RK'`** — Instead of using real photos, initials are rendered as a styled text avatar (CSS-based).

---

## Part 8: `CHART_DATA_ACCURACY` — Weekly Accuracy Trend

```js
export const CHART_DATA_ACCURACY = [
  { week: 'W1', accuracy: 89 },
  { week: 'W2', accuracy: 91 },
  { week: 'W3', accuracy: 90 },
  { week: 'W4', accuracy: 93 },
  { week: 'W5', accuracy: 92 },
  { week: 'W6', accuracy: 94 },
  { week: 'W7', accuracy: 95 },
  { week: 'W8', accuracy: 94 },
]
```

Used by the Expert Dashboard `<AreaChart>` from Recharts. Shows model validation accuracy improving from 89% → 94–95% over 8 weeks.

---

## Part 9: `CHART_DATA_DISEASES` — Disease Distribution

```js
export const CHART_DATA_DISEASES = [
  { name: 'Late Blight',    value: 28, color: '#e63946' },
  { name: 'Early Blight',   value: 22, color: '#f4a261' },
  { name: 'Common Rust',    value: 16, color: '#ffd166' },
  { name: 'Bacterial Spot', value: 14, color: '#4cc9f0' },
  { name: 'Healthy',        value: 12, color: '#52b788' },
  { name: 'Other',          value: 8,  color: '#6b8f76' },
]
```

Used by the Expert Dashboard `<PieChart>`. Values are percentages summing to 100%.

---

## Part 10: `PIPELINE_STEPS` — Landing Page Pipeline Display

```js
export const PIPELINE_STEPS = [
  { id: 1, icon: '📸', label: 'Image Upload',           desc: 'Farmer uploads leaf photo via web or mobile' },
  { id: 2, icon: '⚙️', label: 'FastAPI Backend',         desc: 'Secure REST API processes the request' },
  { id: 3, icon: '🔬', label: 'Disease Detection Agent', desc: 'Agent routes image to CNN model' },
  { id: 4, icon: '🧠', label: 'CNN Model (.keras)',       desc: 'Deep learning model analyzes 38 disease classes' },
  { id: 5, icon: '📊', label: 'Disease Prediction',      desc: 'Confidence scores & class probabilities returned' },
  { id: 6, icon: '💡', label: 'Recommendation Agent',    desc: 'AI agent queries knowledge base' },
  { id: 7, icon: '📚', label: 'Knowledge Base (JSON)',   desc: 'Disease-specific treatment database' },
  { id: 8, icon: '💊', label: 'Treatment & Prevention',  desc: 'Actionable guidance delivered to farmer' },
]
```

Rendered as a vertical step-by-step pipeline diagram on the Landing Page's "How It Works" section. Each step shows an icon, label, and description connected with arrows.

---

## Why Centralize All Data Here?

| Benefit | Explanation |
|---------|-------------|
| **Single Source of Truth** | Change a crop name or treatment once, reflects everywhere |
| **Easy Maintenance** | Adding a new disease = one new entry in this file |
| **No Magic Strings** | No hardcoded data scattered across pages |
| **Testability** | Pure data can be validated/tested in isolation |
| **Backend-Ready** | This file can be replaced with an API call with minimal refactoring |
