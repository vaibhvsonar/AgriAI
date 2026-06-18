import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [role, setRole] = useState('farmer')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== passwordConfirm) {
      return setError('Passwords do not match')
    }

    try {
      setError('')
      setLoading(true)
      await signup(name, email, password, role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create an account')
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
            <span className="auth-icon">🌱</span>
            <h2>Create Account</h2>
            <p className="text-muted">Join AgriAI to monitor your crops</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

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
            
            <div className="form-row">
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
              <div className="form-group">
                <label htmlFor="password-confirm">Confirm Password</label>
                <input
                  type="password"
                  id="password-confirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Select Role</label>
              <div className="role-selector">
                <label className={`role-option ${role === 'farmer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={role === 'farmer'}
                    onChange={() => setRole('farmer')}
                  />
                  <span className="role-icon">🧑‍🌾</span>
                  <span className="role-name">Farmer</span>
                </label>
                <label className={`role-option ${role === 'expert' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="expert"
                    checked={role === 'expert'}
                    onChange={() => setRole('expert')}
                  />
                  <span className="role-icon">👨‍🔬</span>
                  <span className="role-name">Agricultural Expert</span>
                </label>
              </div>
            </div>

            <button disabled={loading} type="submit" className="btn btn-primary auth-submit">
              {loading ? <span className="auth-spinner" /> : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="text-dim">
              Already have an account? <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
