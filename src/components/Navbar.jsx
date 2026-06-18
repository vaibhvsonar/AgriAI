import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/detect', label: 'Detect Disease' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/about', label: 'About' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24C8 24 10 14 16 10C22 6 26 10 26 10C26 10 20 12 18 16C16 20 18 24 18 24C18 24 14 22 12 20C10 18 8 24 8 24Z" fill="url(#leafGrad)"/>
              <path d="M16 10L18 16L14 18L16 10Z" fill="rgba(45,106,79,0.8)"/>
              <defs>
                <linearGradient id="leafGrad" x1="8" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#52b788"/>
                  <stop offset="100%" stopColor="#2d6a4f"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar-logo-text">
            <span className="navbar-logo-agri">Agri</span>
            <span className="navbar-logo-ai">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar-actions">
          {currentUser ? (
            <div className="navbar-user">
              <span className="navbar-user-name" title={currentUser.name}>
                <span className="navbar-user-icon">{currentUser.role === 'expert' ? '👨‍🔬' : '🧑‍🌾'}</span>
                {currentUser.name.split(' ')[0]}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log Out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            id="navbar-menu-btn"
            className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span/>
            <span/>
            <span/>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `navbar-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        
        {currentUser ? (
          <button className="btn btn-ghost" onClick={handleLogout} style={{ margin: '8px 0', border: '1px solid var(--color-border)' }}>
            Log Out ({currentUser.name})
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
            <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)} style={{ border: '1px solid var(--color-border)' }}>Log In</Link>
            <Link to="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  )
}
