import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATS, TESTIMONIALS, PIPELINE_STEPS, CROPS } from '../data/knowledgeBase'
import './LandingPage.css'

/* ── Animated Stat Counter ── */
function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className="stat-value">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

/* ── Floating Particle ── */
function Particle({ style }) {
  return <div className="particle" style={style} />
}

/* ── Hero ── */
function Hero({ navigate }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    animationDuration: `${4 + Math.random() * 6}s`,
    animationDelay: `${Math.random() * 4}s`,
    opacity: 0.3 + Math.random() * 0.4,
  }))

  return (
    <section className="hero" id="hero">
      {/* Particles */}
      <div className="hero-particles" aria-hidden="true">
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* Background glows */}
      <div className="hero-glow hero-glow-1" aria-hidden="true" />
      <div className="hero-glow hero-glow-2" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span className="hero-badge-dot" />
            <span>AI-Powered Agricultural Intelligence</span>
          </div>

          <h1 className="heading-xl hero-title animate-fadeInUp delay-100">
            Detect Crop Diseases
            <br />
            <span className="text-gradient">Instantly with AI</span>
          </h1>

          <p className="hero-description animate-fadeInUp delay-200">
            Upload a leaf image and our deep learning CNN model will identify diseases
            across <strong>38 disease classes</strong> with <strong>94% accuracy</strong> —
            then deliver actionable treatment and prevention guidance.
          </p>

          <div className="hero-actions animate-fadeInUp delay-300">
            <button
              id="hero-detect-btn"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/detect')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload & Detect
            </button>
            <button
              id="hero-learn-btn"
              className="btn btn-ghost btn-lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How It Works
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Mini stats */}
          <div className="hero-mini-stats animate-fadeInUp delay-400">
            {[
              { v: '94%', l: 'Accuracy' },
              { v: '38', l: 'Diseases' },
              { v: '<2s', l: 'Inference' },
              { v: '14', l: 'Crops' },
            ].map(s => (
              <div key={s.l} className="hero-mini-stat">
                <span className="hero-mini-value">{s.v}</span>
                <span className="hero-mini-label">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-visual animate-fadeInUp delay-300">
          <div className="hero-img-frame">
            <div className="hero-img-ring" />
            <img
              src="/hero_leaf.png"
              alt="Healthy tomato leaf analyzed by AgriAI"
              className="hero-img animate-float"
              loading="eager"
            />
            {/* Floating detection overlay */}
            <div className="hero-detect-badge">
              <span className="detect-badge-dot" />
              <span>Analyzing leaf...</span>
              <span className="detect-badge-conf">94.2% Confidence</span>
            </div>
            <div className="hero-result-chip">
              <span>✅</span>
              <span>Healthy — No disease detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  )
}

/* ── Stats Section ── */
function StatsSection() {
  return (
    <section className="stats-section section-sm">
      <div className="container">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={s.label} className={`stat-card animate-fadeInUp delay-${i * 100 + 100}`}>
              <AnimatedCounter target={s.value} suffix={s.suffix} />
              <div className="stat-label">{s.label}</div>
              <div className="stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features Section ── */
const FEATURES = [
  {
    icon: '🧠',
    title: 'Deep Learning CNN',
    desc: 'Custom convolutional neural network trained on the PlantVillage dataset with transfer learning for maximum accuracy.',
    color: '#52b788',
  },
  {
    icon: '⚡',
    title: 'Instant Inference',
    desc: 'Powered by TensorFlow/Keras and FastAPI, get disease predictions in under 2 seconds from image upload to results.',
    color: '#ffd166',
  },
  {
    icon: '💊',
    title: 'Treatment Guidance',
    desc: 'Detailed treatment plans including fungicides, bactericides, cultural practices, and timing recommendations.',
    color: '#f4a261',
  },
  {
    icon: '🛡️',
    title: 'Prevention Strategies',
    desc: 'Long-term prevention guidance covering crop rotation, resistant varieties, irrigation, and scouting protocols.',
    color: '#4cc9f0',
  },
  {
    icon: '📊',
    title: 'Confidence Scoring',
    desc: 'Class probability distributions so you understand how certain the AI is about each prediction.',
    color: '#b5ead7',
  },
  {
    icon: '🌐',
    title: '14 Crop Species',
    desc: 'From tomatoes to grapes, apple to corn — covering the most commercially important crops globally.',
    color: '#c77dff',
  },
]

function FeaturesSection() {
  return (
    <section className="features-section section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="label">Platform Features</span>
          <h2 className="heading-lg">Everything a Farmer Needs</h2>
          <p>A complete end-to-end AI pipeline from image upload to actionable treatment — built for real-world agricultural use.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-card animate-fadeInUp delay-${(i % 3) * 100 + 100}`}>
              <div className="feature-icon" style={{ '--icon-color': f.color }}>
                {f.icon}
              </div>
              <h3 className="heading-sm">{f.title}</h3>
              <p className="text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Pipeline Section ── */
function PipelineSection() {
  return (
    <section className="pipeline-section section dot-grid" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="label">How It Works</span>
          <h2 className="heading-lg">The AI Inference Pipeline</h2>
          <p>From farmer's smartphone to actionable treatment — a seamless agent-based architecture.</p>
        </div>

        <div className="pipeline-container">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} className="pipeline-item">
              <div className="pipeline-step-num">{step.id}</div>
              <div className="pipeline-card card">
                <div className="pipeline-icon">{step.icon}</div>
                <div>
                  <div className="pipeline-step-label">{step.label}</div>
                  <div className="pipeline-step-desc text-muted">{step.desc}</div>
                </div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="pipeline-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Disease Preview ── */
function DiseasePreviewSection({ navigate }) {
  const diseases = [
    { name: 'Tomato Late Blight', severity: 'severe', conf: 96, color: '#e63946' },
    { name: 'Corn Common Rust', severity: 'moderate', conf: 91, color: '#f4a261' },
    { name: 'Apple Scab', severity: 'moderate', conf: 88, color: '#ffd166' },
    { name: 'Potato Early Blight', severity: 'low', conf: 94, color: '#52b788' },
  ]

  return (
    <section className="disease-preview-section section">
      <div className="container">
        <div className="disease-preview-inner">
          <div className="disease-preview-content">
            <span className="label">Sample Results</span>
            <h2 className="heading-lg">See AgriAI in Action</h2>
            <p className="text-muted" style={{ marginBottom: '2rem', lineHeight: 1.8 }}>
              Our CNN model delivers detailed disease diagnostics with confidence scores,
              severity ratings, and complete treatment protocols for each of the 38 disease classes.
            </p>
            <div className="disease-list">
              {diseases.map(d => (
                <div key={d.name} className="disease-list-item">
                  <div className="disease-list-info">
                    <span className="disease-list-name">{d.name}</span>
                    <span
                      className={`badge badge-${d.severity === 'severe' ? 'danger' : d.severity === 'moderate' ? 'warning' : 'success'}`}
                    >
                      {d.severity.charAt(0).toUpperCase() + d.severity.slice(1)}
                    </span>
                  </div>
                  <div className="progress-bar-wrap" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${d.conf}%`, background: `linear-gradient(90deg, ${d.color}88, ${d.color})` }}
                    />
                  </div>
                  <span className="disease-list-conf">{d.conf}%</span>
                </div>
              ))}
            </div>
            <button
              id="preview-try-btn"
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => navigate('/detect')}
            >
              Try with Your Own Image →
            </button>
          </div>
          <div className="disease-preview-img">
            <img
              src="/disease_comparison.png"
              alt="Healthy vs diseased leaf comparison"
              className="disease-compare-img animate-float"
              loading="lazy"
            />
            <div className="disease-compare-labels">
              <span className="compare-label compare-label-bad">🦠 Diseased</span>
              <span className="compare-label compare-label-good">✅ Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Crops Ticker ── */
function CropsTicker() {
  const items = [...CROPS, ...CROPS]
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

/* ── Testimonials ── */
function TestimonialsSection() {
  return (
    <section className="testimonials-section section">
      <div className="container">
        <div className="section-header">
          <span className="label">Testimonials</span>
          <h2 className="heading-lg">Trusted by Farmers & Experts</h2>
          <p>Real feedback from the agricultural community using AgriAI in the field.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`testimonial-card card animate-fadeInUp delay-${i * 200 + 100}`}>
              <div className="testimonial-stars">
                {'★'.repeat(t.rating)}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role text-dim">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Section ── */
function CTASection({ navigate }) {
  return (
    <section className="cta-section section">
      <div className="container">
        <div className="cta-card">
          <div className="cta-glow" />
          <div className="cta-content">
            <span className="label">Get Started Free</span>
            <h2 className="heading-lg cta-title">
              Protect Your Harvest Today
            </h2>
            <p className="text-muted cta-desc">
              Upload a leaf image right now and get instant AI-powered disease diagnosis,
              treatment recommendations, and prevention guidance — completely free.
            </p>
            <div className="cta-actions">
              <button
                id="cta-detect-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/detect')}
              >
                🌿 Start Disease Detection
              </button>
              <button
                id="cta-dashboard-btn"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </button>
            </div>
          </div>
          <div className="cta-farmer-img">
            <img src="/farmer_field.png" alt="Farmer using AgriAI in the field" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Main Export ── */
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <Hero navigate={navigate} />
      <StatsSection />
      <FeaturesSection />
      <PipelineSection />
      <DiseasePreviewSection navigate={navigate} />
      <CropsTicker />
      <TestimonialsSection />
      <CTASection navigate={navigate} />
    </div>
  )
}
