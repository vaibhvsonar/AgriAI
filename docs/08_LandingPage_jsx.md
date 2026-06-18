# 📄 Code Explanation: `src/pages/LandingPage.jsx`

**File:** `src/pages/LandingPage.jsx`  
**Role:** The public home page — first impression for all visitors. Contains 8 distinct sections with animations, stat counters, a disease preview, and calls to action.

---

## Architecture Overview

```
LandingPage.jsx
│
├── AnimatedCounter     ← Smooth count-up animation using IntersectionObserver
├── Particle            ← Decorative floating dot
│
├── Hero                ← Top hero section with CTA buttons and mini-stats
├── StatsSection        ← 4 animated stat cards
├── FeaturesSection     ← 6 feature cards
├── PipelineSection     ← 8-step pipeline from PIPELINE_STEPS
├── DiseasePreviewSection ← Sample disease results with progress bars
├── CropsTicker         ← Infinite scrolling crop marquee
├── TestimonialsSection ← 3 user review cards
└── CTASection          ← Final call-to-action with farmer image
```

---

## Section 1: `AnimatedCounter` — Scroll-Triggered Count-Up

```jsx
function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true        // prevent re-running on scroll
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)    // 0.0 → 1.0
          const ease = 1 - Math.pow(1 - progress, 3)          // cubic ease-out
          setCount(Math.round(ease * target))
          if (progress < 1) requestAnimationFrame(tick)        // 60fps loop
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })          // fires when 50% of element is visible

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}
```

**How `IntersectionObserver` works:**
```
Browser viewport
┌──────────────────────────┐
│                          │
│   [visible content]      │
│                          │
│   ┌────────────────┐     │ ← At 50% intersection
│   │  Stat Card     │     │   observer fires!
│   │  count: 0→94   │     │
│   └────────────────┘     │
│                          │
└──────────────────────────┘
```

**Cubic ease-out formula:**
```js
const ease = 1 - Math.pow(1 - progress, 3)
```
This makes the counter:
- Start fast (0% → 50% happens in the first 30% of time)
- Slow down near the end (95% → 100% takes the final 30% of time)

The effect feels natural — like a number counter decelerating to a stop.

**`requestAnimationFrame(tick)` loop:**
- Calls `tick()` ~60 times per second (matches monitor refresh rate)
- Much smoother than `setInterval` (which is not frame-synchronized)
- Stops automatically when `progress >= 1`

**`hasRun.current = true`:**  
Uses a `useRef` (not `useState`) so the animation only plays once when first scrolled into view — not on every re-render or subsequent scroll.

---

## Section 2: `Particle` Component

```jsx
function Particle({ style }) {
  return <div className="particle" style={style} />
}
```

Renders a tiny decorative dot. 20 particles are created in Hero with randomized positions, sizes, and animation speeds:
```js
const particles = Array.from({ length: 20 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  width: `${4 + Math.random() * 8}px`,        // 4–12px
  height: `${4 + Math.random() * 8}px`,
  animationDuration: `${4 + Math.random() * 6}s`,  // 4–10s float cycle
  animationDelay: `${Math.random() * 4}s`,          // staggered start
  opacity: 0.3 + Math.random() * 0.4,               // 0.3–0.7
}))
```

Each particle gets a random `animationDuration` — so they float at different speeds, creating an organic, living background effect.

---

## Section 3: `Hero` Component

```jsx
function Hero({ navigate }) {
  return (
    <section className="hero" id="hero">
      {/* Animated particles */}
      <div className="hero-particles">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* Background glow blobs */}
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="container hero-inner">
        {/* Left: Content */}
        <div className="hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span className="hero-badge-dot" />
            AI-Powered Agricultural Intelligence
          </div>

          <h1 className="heading-xl hero-title animate-fadeInUp delay-100">
            Detect Crop Diseases
            <br />
            <span className="text-gradient">Instantly with AI</span>
          </h1>

          <p className="hero-description animate-fadeInUp delay-200">
            Upload a leaf image and our deep learning CNN model will identify diseases
            across <strong>38 disease classes</strong> with <strong>94% accuracy</strong>
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions animate-fadeInUp delay-300">
            <button id="hero-detect-btn" onClick={() => navigate('/detect')}>
              Upload & Detect
            </button>
            <button onClick={() => document.getElementById('how-it-works')
              ?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works ↓
            </button>
          </div>

          {/* Mini stat pills */}
          <div className="hero-mini-stats animate-fadeInUp delay-400">
            {[
              { v: '94%', l: 'Accuracy' },
              { v: '38',  l: 'Diseases' },
              { v: '<2s', l: 'Inference' },
              { v: '14',  l: 'Crops' },
            ].map(s => (
              <div key={s.l} className="hero-mini-stat">
                <span className="hero-mini-value">{s.v}</span>
                <span className="hero-mini-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="hero-visual animate-fadeInUp delay-300">
          <img src="/hero_leaf.png" className="hero-img animate-float" />
          <div className="hero-detect-badge">
            <span className="detect-badge-dot" />
            Analyzing leaf... 94.2% Confidence
          </div>
          <div className="hero-result-chip">
            ✅ Healthy — No disease detected
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Key design elements:**

| Element | Purpose |
|---------|---------|
| `animate-fadeInUp` | CSS class that plays a slide-up fade-in animation |
| `delay-100/200/300/400` | Staggered animation delays — elements appear sequentially |
| `text-gradient` | CSS gradient text using `background-clip: text` |
| `?.scrollIntoView({ behavior: 'smooth' })` | Smooth scroll to the "How It Works" section. The `?.` (optional chaining) handles the case where the element doesn't exist yet |
| `hero-glow-1/2` | Blurred circles using CSS `filter: blur()` — creates ambient glow |
| `animate-float` | Infinite floating animation on the leaf image |
| `hero-detect-badge` / `hero-result-chip` | Mock UI overlays on the image showing what the app looks like in use |

---

## Section 4: `StatsSection`

```jsx
function StatsSection() {
  return (
    <section className="stats-section section-sm">
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div key={s.label} className={`stat-card animate-fadeInUp delay-${i * 100 + 100}`}>
            <AnimatedCounter target={s.value} suffix={s.suffix} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Dynamic class names:** `delay-${i * 100 + 100}` generates `delay-100`, `delay-200`, `delay-300`, `delay-400` for each card — creating a staggered appearance effect.

---

## Section 5: `FeaturesSection`

```jsx
const FEATURES = [
  { icon: '🧠', title: 'Deep Learning CNN',
    desc: 'Custom convolutional neural network...', color: '#52b788' },
  { icon: '⚡', title: 'Instant Inference', ... },
  { icon: '💊', title: 'Treatment Guidance', ... },
  { icon: '🛡️', title: 'Prevention Strategies', ... },
  { icon: '📊', title: 'Confidence Scoring', ... },
  { icon: '🌐', title: '14 Crop Species', ... },
]

function FeaturesSection() {
  return (
    <div className="features-grid">
      {FEATURES.map((f, i) => (
        <div key={f.title}
          className={`feature-card animate-fadeInUp delay-${(i % 3) * 100 + 100}`}>
          <div className="feature-icon" style={{ '--icon-color': f.color }}>
            {f.icon}
          </div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  )
}
```

**`(i % 3) * 100 + 100`** — Groups delays by column (3-column grid):
- Column 1 (i=0,3): delay-100
- Column 2 (i=1,4): delay-200
- Column 3 (i=2,5): delay-300

**CSS custom property on icon:** `style={{ '--icon-color': f.color }}` passes the color as a CSS variable. The CSS then uses `color: var(--icon-color)` and `background: rgba(var(--icon-color-rgb), 0.1)` for themed icon backgrounds.

---

## Section 6: `PipelineSection`

```jsx
function PipelineSection() {
  return (
    <div className="pipeline-container">
      {PIPELINE_STEPS.map((step, i) => (
        <div key={step.id} className="pipeline-item">
          <div className="pipeline-step-num">{step.id}</div>
          <div className="pipeline-card card">
            <div className="pipeline-icon">{step.icon}</div>
            <div>
              <div className="pipeline-step-label">{step.label}</div>
              <div className="pipeline-step-desc">{step.desc}</div>
            </div>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <div className="pipeline-arrow">
              {/* Down arrow SVG */}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**`i < PIPELINE_STEPS.length - 1`** — Renders the arrow BETWEEN steps but NOT after the last one. Without this check, there would be a dangling arrow below step 8.

---

## Section 7: `CropsTicker` — Infinite Marquee

```jsx
function CropsTicker() {
  const items = [...CROPS, ...CROPS]   // duplicate for seamless loop
  return (
    <section className="crops-ticker-section">
      <div className="ticker-label">Supported Crops</div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {items.map((crop, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" />
              {crop}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**How the infinite scroll works:**
```
Original: [Tomato, Potato, Corn, Apple, ... 14 crops]
Doubled:  [Tomato, ..., Orange, Tomato, ..., Orange]
              ↑ first copy              ↑ second copy (identical)

CSS animation:
  @keyframes ticker {
    0%   { transform: translateX(0) }
    100% { transform: translateX(-50%) }   ← shift by half (= one copy)
  }
```
When the animation reaches -50% (the end of the first copy), it loops back to 0% — which shows the start of the second copy (identical to the first copy). Seamless!

---

## Section 8: `TestimonialsSection`

```jsx
function TestimonialsSection() {
  return (
    <div className="testimonials-grid">
      {TESTIMONIALS.map((t, i) => (
        <div key={t.name} className={`testimonial-card card animate-fadeInUp delay-${i*200+100}`}>
          <div className="testimonial-stars">
            {'★'.repeat(t.rating)}  {/* e.g., rating=5 → '★★★★★' */}
          </div>
          <p>"{t.text}"</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">{t.avatar}</div>  {/* initials */}
            <div>
              <div>{t.name}</div>
              <div className="text-dim">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**`'★'.repeat(t.rating)`** — JavaScript's `String.prototype.repeat()` creates a string of N star characters. `5 → '★★★★★'`. Cleaner than manually typing 5 stars or using a map.

---

## Complete Section Flow

```
/ (Landing Page)
│
├── Hero      ─── Primary CTA: navigate('/detect')
│                 Secondary: smooth scroll to #how-it-works
├── Stats     ─── 4 animated counters (94%, 38, 54000+, 2s)
├── Features  ─── 6 capability cards
├── Pipeline  ─── 8-step "How It Works" flow
├── Preview   ─── 4 sample disease detections with bars
├── Ticker    ─── Scrolling crop list (14 crops)
├── Reviews   ─── 3 testimonial cards
└── CTA       ─── Final conversion: navigate('/detect') or navigate('/dashboard')
```
