# 📄 Code Explanation: Auth Pages

## Files Covered:
- `src/pages/LoginPage.jsx`
- `src/pages/SignupPage.jsx`

Both files share `Auth.css` and follow similar patterns.

---

## Part A: `LoginPage.jsx`

### Full Source Code

```jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

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
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Line-by-Line Explanation

#### State Variables

```jsx
const [email, setEmail]       = useState('')
const [password, setPassword] = useState('')
const [error, setError]       = useState('')
const [loading, setLoading]   = useState(false)
```

**Controlled components:** Each input is a "controlled component" — React owns the value through state. Every keystroke calls `setEmail` or `setPassword`, keeping state in sync.

| State | Type | Purpose |
|-------|------|---------|
| `email` | string | Controlled value of email input |
| `password` | string | Controlled value of password input |
| `error` | string | Error message to display (empty = no error) |
| `loading` | boolean | Disables button and shows spinner during login |

---

#### The Redirect-Back Pattern

```jsx
const location  = useLocation()
const from = location.state?.from?.pathname || '/dashboard'
```

When `ProtectedRoute` in App.jsx redirects to login, it passes the original URL:
```jsx
// In App.jsx ProtectedRoute:
<Navigate to="/login" state={{ from: location }} replace />
```

Here in LoginPage, we read that back:
```jsx
location.state?.from?.pathname
// e.g., '/dashboard' (where the user was trying to go)
```

`?.` (optional chaining) safely handles the case where `state` or `from` is undefined (e.g., user navigated directly to `/login`). In that case, the fallback `|| '/dashboard'` applies.

After successful login:
```jsx
navigate(from, { replace: true })
// Takes user to: '/dashboard' (or wherever they came from)
// replace: true → removes /login from browser history
```

---

#### `handleSubmit` — Async Form Handler

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()           // prevent browser from submitting the form (page reload)

  if (!email || !password) {   // client-side validation
    setError('Please fill in all fields.')
    return
  }

  try {
    setError('')               // clear any previous error
    setLoading(true)           // show spinner, disable button
    await login(email, password)
    navigate(from, { replace: true })
  } catch (err) {
    setError('Failed to log in. Check your email and password.')
  } finally {
    setLoading(false)          // always reset loading, even on error
  }
}
```

**`try / catch / finally` pattern:**
```
try    → attempt login (may throw if credentials wrong)
catch  → show error message
finally → ALWAYS runs: reset loading state
         (even if login fails or an unexpected error occurs)
```

**Why `e.preventDefault()`?**  
Without it, submitting an HTML form causes a full page navigation (GET or POST request to the server). Since this is a SPA (Single Page App), we handle form submission in JavaScript instead.

---

#### Conditional Error Display

```jsx
{error && <div className="auth-error">{error}</div>}
```

Short-circuit evaluation: if `error` is empty string `''` (falsy), nothing renders. Only when `error` has content does the error div appear. This is the React pattern for conditional rendering.

---

#### Loading Button State

```jsx
<button disabled={loading} type="submit">
  {loading ? <span className="auth-spinner" /> : 'Log In'}
</button>
```

Two things happen when loading:
1. `disabled={loading}` — prevents double-submitting while waiting
2. Button content switches from text to a spinner animation

---

## Part B: `SignupPage.jsx`

### Additional Features vs LoginPage

```jsx
const [name, setName]                 = useState('')
const [email, setEmail]               = useState('')
const [password, setPassword]         = useState('')
const [passwordConfirm, setPasswordConfirm] = useState('')
const [role, setRole]                 = useState('farmer')  // default role
```

**4 text fields + 1 role selector.**

---

#### Password Confirmation Check

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()

  if (password !== passwordConfirm) {
    return setError('Passwords do not match')  // early return pattern
  }

  try {
    await signup(name, email, password, role)
    navigate('/dashboard')          // always goes to dashboard after signup
  } catch (err) {
    setError(err.message || 'Failed to create an account')
  }
}
```

**`return setError(...)`** — A combined return + set in one line. `setError()` returns `undefined`, so `return undefined` exits the function. This is a shorthand for:
```js
setError('Passwords do not match')
return
```

**`err.message || 'Failed to...'`** — The `signup()` function throws `new Error('Email already in use')`. `.message` extracts that string. The `||` fallback handles any other unexpected errors.

---

#### Role Selector

```jsx
const [role, setRole] = useState('farmer')

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
```

**Custom radio button pattern:**  
The native `<input type="radio">` is hidden with CSS. The entire `<label>` becomes clickable (labels are associated with their child input). The visual styling is applied to the `label.role-option` element:

```css
.role-option.active {
  border-color: var(--color-primary);
  background: rgba(82, 183, 136, 0.1);
}
```

**`checked={role === 'farmer'}`** — Makes radio buttons controlled components. React owns the selection state via `useState`.

---

## Shared Concepts

### `Link` vs `navigate`

```jsx
// Link — creates an <a> tag — use in JSX
<Link to="/signup">Sign up</Link>

// navigate — programmatic redirect — use in event handlers
navigate('/dashboard')
```

`Link` renders as an anchor tag (`<a href="/signup">`). Clicking it uses React Router's client-side navigation (no page reload). `navigate()` is used in code (like after form submission).

### `htmlFor` vs `for`

```jsx
<label htmlFor="email">Email Address</label>
<input id="email" ... />
```

In HTML: `<label for="email">`. In JSX: `htmlFor` (because `for` is a reserved JavaScript keyword). This associates the label with the input — clicking the label focuses the input field.

---

## Auth Flow Summary

```
SignupPage
  ↓ fill name, email, password, role
  ↓ handleSubmit() called
  ↓ AuthContext.signup(name, email, password, role)
  ↓ Users saved to localStorage['agriAI_users']
  ↓ Session saved to localStorage['agriAI_user']
  ↓ navigate('/dashboard')

LoginPage
  ↓ fill email, password
  ↓ handleSubmit() called
  ↓ AuthContext.login(email, password)
  ↓ Match found in localStorage['agriAI_users']
  ↓ Session saved to localStorage['agriAI_user']
  ↓ navigate(from || '/dashboard')
```
