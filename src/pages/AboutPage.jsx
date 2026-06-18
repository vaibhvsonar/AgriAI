import { useNavigate } from 'react-router-dom'
import './AboutPage.css'

const TECH_STACK = [
  {
    category: 'AI & Machine Learning',
    icon: '🧠',
    color: '#52b788',
    items: [
      { name: 'TensorFlow 2.x', desc: 'Deep learning framework for model training and inference' },
      { name: 'Keras', desc: 'High-level neural network API for model architecture' },
      { name: 'CNN Architecture', desc: 'Custom convolutional neural network with transfer learning' },
      { name: 'PlantVillage Dataset', desc: '54,000+ labeled leaf images across 38 disease classes' },
    ],
  },
  {
    category: 'Backend & API',
    icon: '⚙️',
    color: '#f4a261',
    items: [
      { name: 'FastAPI', desc: 'High-performance REST API framework with async support' },
      { name: 'Python 3.10+', desc: 'Core programming language for all AI components' },
      { name: 'OpenCV', desc: 'Image preprocessing pipeline — resize, normalize, augment' },
      { name: 'Uvicorn', desc: 'ASGI server for production-grade FastAPI deployment' },
    ],
  },
  {
    category: 'Frontend',
    icon: '🎨',
    color: '#4cc9f0',
    items: [
      { name: 'React', desc: 'Component-based UI framework for interactive interface' },
      { name: 'React Router', desc: 'Client-side routing for single-page application' },
      { name: 'Recharts', desc: 'Data visualization library for analytics charts' },
      { name: 'Vanilla CSS', desc: 'Custom design system with glassmorphism and animations' },
    ],
  },
  {
    category: 'Data & Knowledge',
    icon: '📚',
    color: '#c77dff',
    items: [
      { name: 'JSON Knowledge Base', desc: 'Expert-curated disease treatment and prevention database' },
      { name: 'Agent Architecture', desc: 'Two-agent system: Detection Agent + Recommendation Agent' },
      { name: 'REST APIs', desc: 'RESTful endpoints for image upload and result retrieval' },
      { name: 'Vite', desc: 'Next-generation frontend build tooling for fast development' },
    ],
  },
]

const MODEL_SPECS = [
  { label: 'Architecture', value: 'CNN (Custom + Transfer Learning)' },
  { label: 'Base Model', value: 'MobileNetV2 / EfficientNet' },
  { label: 'Dataset', value: 'PlantVillage (54,000+ images)' },
  { label: 'Classes', value: '38 disease classes across 14 crops' },
  { label: 'Validation Accuracy', value: '94.2%' },
  { label: 'Inference Time', value: '<2 seconds (CPU), <0.5s (GPU)' },
  { label: 'Input Size', value: '224×224 RGB' },
  { label: 'Optimizer', value: 'Adam (lr=1e-4, fine-tuned 1e-5)' },
  { label: 'Loss Function', value: 'Categorical Cross-Entropy' },
  { label: 'Batch Size', value: '32' },
  { label: 'Epochs', value: '25 (with EarlyStopping)' },
  { label: 'Model Format', value: '.keras (TensorFlow SavedModel)' },
]

const PIPELINE_DETAILS = [
  {
    step: '01',
    title: 'Image Preprocessing',
    icon: '🖼️',
    details: [
      'Resize to 224×224 using OpenCV',
      'Normalize pixel values to [0, 1]',
      'Apply data augmentation (flip, rotate, zoom)',
      'Convert to TensorFlow tensor format',
    ],
  },
  {
    step: '02',
    title: 'CNN Feature Extraction',
    icon: '🔍',
    details: [
      'Convolutional layers extract spatial features',
      'Batch normalization and dropout regularization',
      'Global average pooling reduces spatial dimensions',
      'Dense layers map features to class probabilities',
    ],
  },
  {
    step: '03',
    title: 'Disease Classification',
    icon: '🎯',
    details: [
      'Softmax activation produces class probabilities',
      'Top-5 predictions with confidence scores returned',
      'Threshold-based healthy/diseased classification',
      'Class-conditional severity estimation',
    ],
  },
  {
    step: '04',
    title: 'Knowledge Base Query',
    icon: '💡',
    details: [
      'Recommendation Agent receives predicted class',
      'JSON knowledge base lookup for disease info',
      'Structured response: symptoms + treatments + prevention',
      'Severity-based urgency classification',
    ],
  },
]

const LEARNING_OUTCOMES = [
  { icon: '🤖', title: 'AI Model Development', desc: 'End-to-end CNN training pipeline including data augmentation, transfer learning, and model evaluation.' },
  { icon: '🔗', title: 'Backend API Design', desc: 'RESTful API architecture with FastAPI, file handling, async endpoints, and validation.' },
  { icon: '🧩', title: 'Agent-Based Architecture', desc: 'Separating concerns with specialized agents: one for detection, one for recommendations.' },
  { icon: '📖', title: 'Knowledge Systems', desc: 'Structuring expert agricultural knowledge into machine-readable JSON for agent querying.' },
  { icon: '💻', title: 'Frontend Engineering', desc: 'Building responsive, animated UIs with React and maintaining state across a multi-page app.' },
  { icon: '🚀', title: 'MLOps Thinking', desc: 'Planning for deployment, monitoring, model versioning, and continuous improvement cycles.' },
]

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="about-page">
      <div className="about-bg-glow-1" />
      <div className="about-bg-glow-2" />

      {/* Hero */}
      <section className="about-hero section">
        <div className="container">
          <div className="about-hero-inner">
            <div className="about-hero-content animate-fadeInUp">
              <span className="label">About AgriAI</span>
              <h1 className="heading-xl">
                AI for
                <br />
                <span className="text-gradient">Real Farmers</span>
              </h1>
              <p className="about-hero-desc text-muted">
                AgriAI is an end-to-end AI-powered crop disease detection platform
                combining deep learning, knowledge systems, and modern web engineering
                to solve a critical real-world agricultural problem.
              </p>
              <div className="about-hero-tags">
                {['#DeepLearning', '#TensorFlow', '#FastAPI', '#ReactJS', '#ComputerVision', '#AgriTech', '#MLOps'].map(t => (
                  <span key={t} className="about-tag">{t}</span>
                ))}
              </div>
              <button
                id="about-try-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/detect')}
                style={{ marginTop: '0.5rem' }}
              >
                Try AgriAI →
              </button>
            </div>
            <div className="about-hero-visual animate-fadeInUp delay-200">
              <img
                src="/cnn_architecture.png"
                alt="CNN deep learning architecture visualization"
                className="about-cnn-img animate-float"
                loading="lazy"
              />
              <div className="about-cnn-overlay">
                <span className="badge badge-success">🧠 CNN Model Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Specs */}
      <section className="model-specs-section section-sm">
        <div className="container">
          <div className="section-header">
            <span className="label">Technical Specifications</span>
            <h2 className="heading-lg">Model Architecture</h2>
            <p>Key parameters and configuration of the trained CNN model.</p>
          </div>
          <div className="model-specs-grid animate-fadeInUp delay-100">
            {MODEL_SPECS.map(spec => (
              <div key={spec.label} className="model-spec-row">
                <span className="model-spec-label">{spec.label}</span>
                <span className="model-spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Detail */}
      <section className="pipeline-detail-section section dot-grid">
        <div className="container">
          <div className="section-header">
            <span className="label">Under the Hood</span>
            <h2 className="heading-lg">Inference Pipeline</h2>
            <p>How a leaf image becomes actionable disease intelligence in under 2 seconds.</p>
          </div>
          <div className="pipeline-detail-grid">
            {PIPELINE_DETAILS.map((p, i) => (
              <div key={p.step} className={`pipeline-detail-card card animate-fadeInUp delay-${i * 100 + 100}`}>
                <div className="pipeline-detail-header">
                  <div className="pipeline-detail-step">{p.step}</div>
                  <span className="pipeline-detail-icon">{p.icon}</span>
                  <h3 className="heading-sm">{p.title}</h3>
                </div>
                <ul className="pipeline-detail-list">
                  {p.details.map(d => (
                    <li key={d}>
                      <span className="pipeline-detail-dot" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack-section section">
        <div className="container">
          <div className="section-header">
            <span className="label">Technology</span>
            <h2 className="heading-lg">Full Tech Stack</h2>
            <p>The complete technology ecosystem powering AgriAI from training to deployment.</p>
          </div>
          <div className="tech-stack-grid">
            {TECH_STACK.map((cat, i) => (
              <div
                key={cat.category}
                className={`tech-cat-card card animate-fadeInUp delay-${i * 100 + 100}`}
                style={{ '--cat-color': cat.color }}
              >
                <div className="tech-cat-header">
                  <span className="tech-cat-icon">{cat.icon}</span>
                  <h3 className="heading-sm">{cat.category}</h3>
                </div>
                <div className="tech-items">
                  {cat.items.map(item => (
                    <div key={item.name} className="tech-item">
                      <div className="tech-item-name">{item.name}</div>
                      <div className="tech-item-desc text-dim">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="learning-section section-sm">
        <div className="container">
          <div className="section-header">
            <span className="label">Key Learnings</span>
            <h2 className="heading-lg">Beyond Model Accuracy</h2>
            <p>Building AgriAI required thinking like a product engineer — not just a data scientist.</p>
          </div>
          <div className="learning-grid">
            {LEARNING_OUTCOMES.map((l, i) => (
              <div key={l.title} className={`learning-card card animate-fadeInUp delay-${i * 100 + 100}`}>
                <span className="learning-icon">{l.icon}</span>
                <div>
                  <h4 className="learning-title">{l.title}</h4>
                  <p className="learning-desc text-muted">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section section">
        <div className="container">
          <div className="about-cta-card">
            <div className="about-cta-glow" />
            <h2 className="heading-lg">Ready to Detect Crop Diseases?</h2>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto', lineHeight: 1.8 }}>
              Upload a leaf image and experience the AI pipeline in action.
              94% accuracy across 38 disease classes — no account required.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                id="about-cta-detect-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/detect')}
              >
                🌿 Detect Disease Now
              </button>
              <button
                id="about-cta-dashboard-btn"
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
