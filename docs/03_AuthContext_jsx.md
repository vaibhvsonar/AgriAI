# 📄 Code Explanation: `src/context/AuthContext.jsx`

**File:** `src/context/AuthContext.jsx`  
**Role:** Global authentication state manager — provides `currentUser`, `login()`, `signup()`, and `logout()` to the entire app via React Context API.

---

## Full Source Code

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agriAI_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
          setCurrentUser(sessionUser);
          localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
          resolve(sessionUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  };

  const signup = (name, email, password, role) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
        if (users.some(u => u.email === email)) {
          reject(new Error('Email already in use'));
          return;
        }
        const newUser = { id: Date.now().toString(), name, email, password, role };
        users.push(newUser);
        localStorage.setItem('agriAI_users', JSON.stringify(users));
        const sessionUser = { id: newUser.id, name, email, role };
        setCurrentUser(sessionUser);
        localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
        resolve(sessionUser);
      }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agriAI_user');
  };

  const value = { currentUser, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

---

## Concept: React Context API

React Context solves the "prop drilling" problem. Without context, you'd have to pass `currentUser` as a prop through every component that needs it:

```
App → Navbar → UserMenu (needs currentUser)
App → DashboardPage (needs currentUser)
App → ProtectedRoute (needs currentUser)
```

With Context, any component can call `useAuth()` and directly get the data:
```
AuthContext (global store)
    ↓  (any component reads directly)
useAuth() → { currentUser, login, logout }
```

---

## Line-by-Line Explanation

### Creating the Context

```jsx
const AuthContext = createContext();
```
- Creates an empty context object.
- Think of it as creating a "broadcast channel" that any component can tune into.
- No default value — components must be wrapped in `AuthProvider` to receive data.

---

### Custom Hook: `useAuth`

```jsx
export const useAuth = () => useContext(AuthContext);
```
- A convenience wrapper around `useContext(AuthContext)`.
- Instead of writing `useContext(AuthContext)` everywhere, components just call `useAuth()`.
- Returns: `{ currentUser, login, signup, logout }`

---

### `AuthProvider` — State and Initialization

```jsx
const [currentUser, setCurrentUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const storedUser = localStorage.getItem('agriAI_user');
  if (storedUser) {
    setCurrentUser(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);
```

**Why `loading` state?**
On app startup, React renders immediately — but we need to check localStorage first to see if the user was already logged in. The `loading` flag prevents the app from rendering until this check is done:

```
App starts → loading=true → nothing renders
     ↓
useEffect reads localStorage
     ↓
setCurrentUser (if found)
     ↓
setLoading(false) → app renders with correct auth state
```

Without `loading`, the app would flash the login screen momentarily even for a logged-in user — a bad UX.

---

### `login` Function

```jsx
const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        setCurrentUser(sessionUser);
        localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
        resolve(sessionUser);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 800);
  });
};
```

**Step-by-step:**
1. Returns a Promise so callers can `await login(email, password)` and handle errors
2. `setTimeout(800ms)` — simulates network latency for a realistic UX
3. Reads all registered users from `localStorage['agriAI_users']`
4. `Array.find()` checks if any user matches both email AND password
5. **If found:**
   - Creates `sessionUser` — a safe object without password field
   - Updates React state: `setCurrentUser(sessionUser)`
   - Persists session to `localStorage['agriAI_user']` for page refresh survival
   - `resolve(sessionUser)` — Promise succeeds
6. **If not found:**
   - `reject(new Error(...))` — Promise fails, caller shows error

**Why exclude password from sessionUser?**
```jsx
// WRONG: stores password in memory and React state
const sessionUser = { ...user }

// CORRECT: only safe fields
const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role }
```
Never keep passwords in React state — they could be exposed via React DevTools.

---

### `signup` Function

```jsx
const signup = (name, email, password, role) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('agriAI_users')) || [];
      if (users.some(u => u.email === email)) {
        reject(new Error('Email already in use'));
        return;
      }
      const newUser = { id: Date.now().toString(), name, email, password, role };
      users.push(newUser);
      localStorage.setItem('agriAI_users', JSON.stringify(users));
      const sessionUser = { id: newUser.id, name, email, role };
      setCurrentUser(sessionUser);
      localStorage.setItem('agriAI_user', JSON.stringify(sessionUser));
      resolve(sessionUser);
    }, 800);
  });
};
```

**Step-by-step:**
1. Reads existing users array
2. Checks for duplicate email: `users.some(u => u.email === email)` → rejects if taken
3. Creates new user with `Date.now().toString()` as a unique ID
4. Adds user to array, saves back to localStorage (this is the "database")
5. Creates safe session (no password), sets React state, persists session
6. Automatically logs in the user after signup (no separate login step needed)

---

### `logout` Function

```jsx
const logout = () => {
  setCurrentUser(null);
  localStorage.removeItem('agriAI_user');
};
```
- Sets `currentUser` to `null` → all `ProtectedRoute` guards will redirect to `/login`
- Removes the session from localStorage → page refresh won't re-authenticate

---

### Context Provider

```jsx
const value = { currentUser, login, signup, logout };

return (
  <AuthContext.Provider value={value}>
    {!loading && children}
  </AuthContext.Provider>
);
```
- `value` is the object all consumers receive when they call `useAuth()`
- `{!loading && children}` — renders nothing until the localStorage check is done

---

## Data Flow Diagram

```
localStorage['agriAI_users']     ← permanent user "database"
localStorage['agriAI_user']      ← active session (survives refresh)
         ↕
    AuthContext.Provider
         ↕
    useAuth() hook
         ↕
┌──────────────────────────────────────┐
│ currentUser: { id, name, email, role }│
│ login(email, password) → Promise     │
│ signup(name, email, pass, role)      │
│ logout()                             │
└──────────────────────────────────────┘
         ↕ (consumed by)
  Navbar, ProtectedRoute, DashboardPage, DetectPage
```

---

## localStorage Schema

```
Key: agriAI_users
Value: [
  { id: "1718700000000", name: "Raj Kumar", email: "raj@farm.com",
    password: "abc123", role: "farmer" }
]

Key: agriAI_user  (session — no password)
Value: { id: "1718700000000", name: "Raj Kumar",
         email: "raj@farm.com", role: "farmer" }
```

> ⚠️ **Production Note:** In a real app, passwords must be hashed with bcrypt on a server. localStorage auth is for demo purposes only.
