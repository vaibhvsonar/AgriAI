import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css' // We will use a shared Auth.css for both login and signup

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      setError('')
      setLoading(true)
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError('Failed to log in. Check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-container animate-fadeInUp">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-icon">🌿</span>
            <h2>Welcome Back</h2>
            <p className="text-muted">Log in to your AgriAI account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary auth-submit">
              {loading ? <span className="auth-spinner" /> : 'Log In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="text-dim">
              Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
          </div>
          
          <div className="auth-demo-hint text-dim" style={{marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center'}}>
            <p><strong>Demo Note:</strong> Any registered credentials will work via localStorage.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
