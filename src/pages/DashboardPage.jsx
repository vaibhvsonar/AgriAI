import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import {
  CHART_DATA_ACCURACY, CHART_DATA_DISEASES
} from '../data/knowledgeBase'
import './DashboardPage.css'

/* ── Custom Tooltip ── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip-value" style={{ color: p.color }}>
          {p.name}: {p.value}{p.name === 'accuracy' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}

/* ── Expert Dashboard Components ── */
function ExpertAnalytics() {
  return (
    <div className="charts-grid">
      <div className="chart-card card animate-fadeInUp delay-100">
        <div className="chart-card-header">
          <div>
            <h3 className="heading-sm">Global Model Accuracy</h3>
            <p className="text-dim" style={{ fontSize: '0.82rem' }}>Weekly validation accuracy (%)</p>
          </div>
          <span className="badge badge-success">+5% vs baseline</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA_ACCURACY} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#52b788" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#52b788" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: '#6b8f76', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[85, 100]} tick={{ fill: '#6b8f76', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="accuracy" name="accuracy" stroke="#52b788" strokeWidth={2.5} fill="url(#accuracyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card card animate-fadeInUp delay-200">
        <div className="chart-card-header">
          <div>
            <h3 className="heading-sm">Global Disease Distribution</h3>
            <p className="text-dim" style={{ fontSize: '0.82rem' }}>Breakdown of detected conditions</p>
          </div>
        </div>
        <div className="pie-chart-layout">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CHART_DATA_DISEASES} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {CHART_DATA_DISEASES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, 'Share']}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {CHART_DATA_DISEASES.map(d => (
              <div key={d.name} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: d.color }} />
                <span className="pie-legend-name">{d.name}</span>
                <span className="pie-legend-val">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div className="history-section card animate-fadeInUp delay-300">
      <div className="history-header">
        <div>
          <h2 className="heading-sm">Pending Reviews</h2>
          <p className="text-dim" style={{ fontSize: '0.82rem', marginTop: 2 }}>Scans submitted by farmers for expert consultation</p>
        </div>
        <span className="badge badge-warning">{pendingReviews.length} Pending</span>
      </div>

      {pendingReviews.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-dim)' }}>
          No pending reviews. Good job!
        </div>
      ) : (
        <div className="reviews-feed">
          {pendingReviews.map(scan => (
            <div key={scan.id} className="review-card">
              <div className="review-header">
                <div>
                  <span className="badge badge-danger" style={{marginRight: 8}}>{scan.severity}</span>
                  <strong>{scan.disease}</strong>
                </div>
                <span className="text-dim">{new Date(scan.date).toLocaleDateString()}</span>
              </div>
              <p className="text-muted" style={{fontSize: '0.9rem', marginBottom: 16}}>
                Farmer {scan.farmerName} requested a review. AI Confidence: {Math.round(scan.confidence * 100)}%
              </p>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleResolve(scan.id, e.target.note.value)
              }} style={{display: 'flex', gap: '8px'}}>
                <input type="text" name="note" placeholder="Add treatment advice..." className="form-input" required style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary btn-sm">Submit Review</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Farmer Dashboard Components ── */
function WeatherWidget() {
  // Simulated weather API response
  const weatherData = {
    temp: 28,
    humidity: 82,
    moisture: 'Low',
    condition: '⛈️',
    forecast: 'Thunderstorms expected'
  }

  // AI Predictive Engine Logic
  const alerts = []
  if (weatherData.humidity > 80 && weatherData.temp > 25) {
    alerts.push({
      id: 1,
      type: 'danger',
      title: 'High Powdery Mildew Risk',
      desc: 'High humidity and warm temperatures create optimal conditions for fungal growth. Preventative copper fungicide spray recommended within 48h.',
      icon: '🍄'
    })
  }
  if (weatherData.moisture === 'Low') {
    alerts.push({
      id: 2,
      type: 'warning',
      title: 'Drought Stress Warning',
      desc: 'Soil moisture is critically low. This increases susceptibility to Leaf Scorch. Increase irrigation.',
      icon: '🔥'
    })
  }

  return (
    <div className="weather-widget-container">
      <div className="weather-widget card animate-fadeInUp delay-100">
        <div className="weather-header">
          <h3 className="heading-sm">Farm Conditions</h3>
          <span className="text-dim" style={{fontSize: '0.8rem'}}>Simulated Live Data</span>
        </div>
        <div className="weather-body">
          <div className="weather-main">
            <span className="weather-icon">{weatherData.condition}</span>
            <div className="weather-temp">{weatherData.temp}°C</div>
          </div>
          <div className="weather-stats">
            <div className="weather-stat">
              <span className="text-dim">Humidity</span>
              <strong>{weatherData.humidity}%</strong>
            </div>
            <div className="weather-stat">
              <span className="text-dim">Soil Moisture</span>
              <strong style={{color: '#e63946'}}>{weatherData.moisture}</strong>
            </div>
            <div className="weather-stat">
              <span className="text-dim">Disease Risk</span>
              <strong style={{color: '#e63946'}}>High</strong>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="ai-alerts-section animate-fadeInUp delay-200">
          <div className="ai-alerts-header">
            <h3 className="heading-sm">Predictive AI Alerts</h3>
            <span className="badge badge-danger">{alerts.length} Active</span>
          </div>
          <div className="ai-alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`ai-alert-card type-${alert.type}`}>
                <span className="ai-alert-icon">{alert.icon}</span>
                <div className="ai-alert-content">
                  <div className="ai-alert-title">{alert.title}</div>
                  <div className="ai-alert-desc">{alert.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FarmMap({ userScans }) {
  // Ensure each scan has stable mock coordinates (for demonstration purposes)
  const mapScans = userScans.map((s, i) => {
    // Generate stable pseudo-random coordinates between 10% and 90%
    const seed = i * 137.5
    const x = 10 + (seed % 80)
    const y = 10 + ((seed * 7) % 80)
    return { ...s, mapX: x, mapY: y }
  })

  return (
    <div className="farm-map-card card animate-fadeInUp delay-200">
      <div className="farm-map-header">
        <div>
          <h3 className="heading-sm">Interactive Farm Map</h3>
          <p className="text-dim" style={{ fontSize: '0.82rem' }}>Geospatial tracking of crop scans</p>
        </div>
        <div className="farm-map-legend">
          <span><span className="legend-dot" style={{background: '#e63946'}}/> Severe</span>
          <span><span className="legend-dot" style={{background: '#f4a261'}}/> Moderate</span>
          <span><span className="legend-dot" style={{background: '#52b788'}}/> Low/Healthy</span>
        </div>
      </div>
      
      <div className="farm-map-container">
        {/* The map background image */}
        <div className="farm-map-bg"></div>
        
        {/* Grid lines */}
        <div className="farm-map-grid" />
        
        {/* Render markers */}
        {mapScans.map(scan => {
          let color = '#52b788'
          if (scan.severity === 'Severe') color = '#e63946'
          if (scan.severity === 'Moderate') color = '#f4a261'
          
          return (
            <div 
              key={scan.id} 
              className="farm-map-marker"
              style={{ left: `${scan.mapX}%`, top: `${scan.mapY}%`, backgroundColor: color }}
              title={`${scan.crop}: ${scan.disease}\n${scan.date}`}
            >
              <div className="farm-map-marker-pulse" style={{ borderColor: color }}></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PersonalHistory({ userScans, requestReview }) {
  if (userScans.length === 0) {
    return (
      <div className="history-section card animate-fadeInUp delay-300" style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="text-muted">You haven't scanned any crops yet.</p>
      </div>
    )
  }

  const severityBadge = (sev) => {
    if (!sev || sev === '—') return <span className="badge badge-success">Healthy</span>
    if (sev === 'Severe') return <span className="badge badge-danger">Severe</span>
    if (sev === 'Moderate') return <span className="badge badge-warning">Moderate</span>
    return <span className="badge badge-success">Low</span>
  }

  const statusBadge = (status) => {
    if (status === 'Healthy') return <span className="badge badge-success">✅ Healthy</span>
    if (status === 'Pending Review') return <span className="badge badge-warning">⏳ Pending Expert</span>
    if (status === 'Reviewed') return <span className="badge badge-info">👨‍🔬 Reviewed</span>
    return <span className="badge badge-warning">👁 Monitoring</span>
  }

  return (
    <div className="history-section card animate-fadeInUp delay-300">
      <div className="history-header">
        <div>
          <h2 className="heading-sm">My Detections</h2>
          <p className="text-dim" style={{ fontSize: '0.82rem', marginTop: 2 }}>Your recent crop scans</p>
        </div>
      </div>

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Disease</th>
              <th>Confidence</th>
              <th>Severity</th>
              <th>Status / Expert Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {userScans.map(row => (
              <tr key={row.id} className="history-row">
                <td className="text-muted">{new Date(row.date).toLocaleDateString()}</td>
                <td className="disease-cell">{row.disease}</td>
                <td>
                  <div className="conf-cell">
                    <div className="conf-bar-wrap">
                      <div className="conf-bar-fill" style={{ width: `${row.confidence * 100}%` }} />
                    </div>
                    <span className="conf-pct">{Math.round(row.confidence * 100)}%</span>
                  </div>
                </td>
                <td>{severityBadge(row.severity)}</td>
                <td>
                  {statusBadge(row.status)}
                  {row.expertNote && <div style={{fontSize: '0.8rem', marginTop: 4, color: 'var(--color-primary-light)'}}>"{row.expertNote}"</div>}
                </td>
                <td>
                  {row.status === 'Monitoring' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => requestReview(row.id)}>Ask Expert</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main Export ── */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  
  // State for Farmer Dashboard Tabs
  const [activeTab, setActiveTab] = useState('overview')

  // Global mock database for "Expert Review" workflow
  const [globalScans, setGlobalScans] = useState([])
  const [userScans, setUserScans] = useState([])

  useEffect(() => {
    // Simulated Global DB for scans (so experts can see farmer scans)
    const scans = JSON.parse(localStorage.getItem('agriAI_global_scans')) || []
    setGlobalScans(scans)
    setUserScans(scans.filter(s => s.userId === currentUser.id))
  }, [currentUser.id])

  const isExpert = currentUser?.role === 'expert'
  
  const requestReview = (scanId) => {
    const updated = globalScans.map(scan => {
      if (scan.id === scanId) {
        return { ...scan, status: 'Pending Review' }
      }
      return scan
    })
    setGlobalScans(updated)
    setUserScans(updated.filter(s => s.userId === currentUser.id))
    localStorage.setItem('agriAI_global_scans', JSON.stringify(updated))
  }

  // Common stats calculation
  const scansToUse = isExpert ? globalScans : userScans
  const numScans = scansToUse.length
  const numSevere = scansToUse.filter(s => s.severity === 'Severe').length
  const avgConf = numScans > 0 ? (scansToUse.reduce((s, d) => s + d.confidence, 0) / numScans) * 100 : 0
  const numHealthy = scansToUse.filter(s => s.disease.includes('healthy') || s.disease === 'Healthy').length
  
  // Simulated Financial Impact based on detected diseases
  const financialImpact = (numSevere * 450) + ((numScans - numSevere - numHealthy) * 120)

  const summaryCards = [
    { label: isExpert ? 'Global Scans' : 'My Scans', value: numScans, icon: '📸', color: '#52b788' },
    { label: 'Severe Cases', value: numSevere, icon: '🚨', color: '#e63946' },
    { label: 'Crop Value Protected', value: `$${financialImpact.toLocaleString()}`, icon: '💰', color: '#f4a261' },
    { label: 'Healthy Crops', value: numHealthy, icon: '✅', color: '#4cc9f0' },
  ]

  return (
    <div className="dashboard-page">
      <div className="dashboard-bg-glow" />

      <div className="container dashboard-container">
        {/* Header */}
        <div className="dashboard-header animate-fadeInUp">
          <div>
            <span className="label">{isExpert ? 'Expert Portal' : 'Farmer Dashboard'}</span>
            <h1 className="heading-lg">Welcome, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-muted">
              {isExpert 
                ? 'Monitor global crop health trends and review farmer scan submissions.'
                : 'Track your personal crop detections and get expert advice.'}
            </p>
          </div>
          {!isExpert && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/detect')}
            >
              + New Scan
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          {summaryCards.map((c, i) => (
            <div key={c.label} className={`summary-card animate-fadeInUp delay-${i * 100 + 100}`}>
              <div className="summary-card-header">
                <span className="summary-card-icon">{c.icon}</span>
              </div>
              <div className="summary-card-value" style={{ color: c.color }}>{c.value}</div>
              <div className="summary-card-label">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Farmer Dashboard Tabs */}
        {!isExpert && (
          <div className="dashboard-tabs animate-fadeInUp delay-300">
            <button 
              className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`} 
              onClick={() => setActiveTab('overview')}
            >
              <span className="tab-icon">🌦️</span> Overview & Alerts
            </button>
            <button 
              className={`dashboard-tab ${activeTab === 'map' ? 'active' : ''}`} 
              onClick={() => setActiveTab('map')}
            >
              <span className="tab-icon">🗺️</span> Farm Map
            </button>
            <button 
              className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`} 
              onClick={() => setActiveTab('history')}
            >
              <span className="tab-icon">📋</span> Scan History
            </button>
          </div>
        )}

        {isExpert ? (
          <>
            <ExpertAnalytics />
            <PendingReviewsFeed globalScans={globalScans} setGlobalScans={setGlobalScans} />
          </>
        ) : (
          <div className="dashboard-tab-content">
            {activeTab === 'overview' && (
              <div className="farmer-dashboard-row animate-fadeInUp">
                <WeatherWidget />
                <div className="dashboard-welcome-card card">
                  <h3 className="heading-sm">Welcome to AgriAI</h3>
                  <p className="text-dim">Your digital assistant for crop health monitoring. Use the tabs above to navigate your farm's spatial map or view your detailed scan history.</p>
                  <img src="/assets/farmer_field.png" alt="" style={{width: '100%', marginTop: '1rem', borderRadius: '8px', opacity: 0.5}} />
                </div>
              </div>
            )}
            
            {activeTab === 'map' && (
              <div className="animate-fadeInUp">
                <FarmMap userScans={userScans} />
              </div>
            )}
            
            {activeTab === 'history' && (
              <div className="animate-fadeInUp">
                <PersonalHistory userScans={userScans} requestReview={requestReview} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
