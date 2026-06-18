# 📄 Code Explanation: `src/App.jsx`

**File:** `src/App.jsx`  
**Role:** Root component — sets up routing, authentication provider, persistent layout (Navbar + Footer), and protected routes.

---

## Full Source Code

```jsx
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import DetectPage from './pages/DetectPage'
import ResultsPage from './pages/ResultsPage'
import DashboardPage from './pages/DashboardPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/detect" element={<DetectPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

---

## Section-by-Section Explanation

### Section 1 — Imports

```jsx
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
```
Imports from React Router DOM v6:
| Import | Purpose |
|--------|---------|
| `BrowserRouter` | Wraps the app to enable URL-based navigation using the browser History API |
| `Routes` | Container for all `<Route>` definitions |
| `Route` | Maps a URL path to a component |
| `useLocation` | Hook that returns the current URL location object |
| `Navigate` | Component that performs a programmatic redirect |

```jsx
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
```
- `useEffect` — for the scroll-to-top side effect
- `AuthProvider` — wraps the app so all children can access login/logout state
- `useAuth` — hook used inside `ProtectedRoute` to check if user is logged in

---

### Section 2 — `ScrollToTop` Component

```jsx
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
```

**Problem it solves:** When a user navigates from a scrolled-down page (e.g., Landing Page) to a new page (e.g., Detect), the scroll position stays where it was. This is confusing.

**How it works:**
1. `useLocation()` gives the current URL path (e.g., `/detect`)
2. `useEffect` runs whenever `pathname` changes — i.e., on every page navigation
3. `window.scrollTo(0, 0)` instantly scrolls the window to the very top
4. Returns `null` — renders nothing visible, purely a behavioral component

---

### Section 3 — `ProtectedRoute` Component

```jsx
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
```

**Purpose:** Guards the `/dashboard` route from unauthenticated access.

**Step-by-step:**
1. `useAuth()` reads `currentUser` from the Auth Context (null if not logged in)
2. If `currentUser` is `null` (not logged in):
   - `<Navigate>` performs an **instant redirect** to `/login`
   - `state={{ from: location }}` saves where the user was trying to go — so after login, they can be sent to `/dashboard` automatically
   - `replace` replaces the current history entry so the back button doesn't loop
3. If `currentUser` exists → render `children` (the `DashboardPage`)

---

### Section 4 — `App` Component (Main)

```jsx
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>...</Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

**Layer-by-layer breakdown:**

```
<AuthProvider>           ← Provides login/logout state to ALL children
  <BrowserRouter>        ← Enables URL routing
    <ScrollToTop />      ← Auto-scrolls to top on each route change
    <div.app-wrapper>    ← Flexbox column layout: Navbar + Content + Footer
      <Navbar />         ← Always visible at top
      <main>             ← Page content area
        <Routes>         ← Only renders the matching route
          <Route path="/" → LandingPage />
          <Route path="/detect" → DetectPage />
          <Route path="/results" → ResultsPage />
          <Route path="/about" → AboutPage />
          <Route path="/login" → LoginPage />
          <Route path="/signup" → SignupPage />
          <Route path="/dashboard" →
            <ProtectedRoute>       ← Auth guard
              <DashboardPage />    ← Only if logged in
            </ProtectedRoute>
          />
        </Routes>
      </main>
      <Footer />         ← Always visible at bottom
    </div>
  </BrowserRouter>
</AuthProvider>
```

---

## Route Map Summary

| URL Path | Component | Auth Required |
|----------|-----------|:---:|
| `/` | `LandingPage` | No |
| `/detect` | `DetectPage` | No |
| `/results` | `ResultsPage` | No |
| `/about` | `AboutPage` | No |
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/dashboard` | `DashboardPage` (via ProtectedRoute) | ✅ Yes |

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| `AuthProvider` wraps `BrowserRouter` | Auth state is needed by `ProtectedRoute` which uses `useLocation`, so both must be nested correctly |
| `ScrollToTop` is inside `BrowserRouter` | It needs access to `useLocation` which requires a Router ancestor |
| Navbar and Footer are outside `<Routes>` | They appear on every page without being re-declared in each route |
| `replace` on Navigate | Prevents the login page from appearing in browser history when redirect happens |
