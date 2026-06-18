# 📚 AgriAI — Code Explanation Index

This folder contains detailed, line-by-line explanations for every source file in the AgriAI project.

---

## 📂 Files in This `docs/` Folder

| File | Explains | Key Topics Covered |
|------|----------|--------------------|
| [01_main_jsx.md](./01_main_jsx.md) | `src/main.jsx` | Entry point, StrictMode, createRoot, React 18 |
| [02_App_jsx.md](./02_App_jsx.md) | `src/App.jsx` | Router setup, ProtectedRoute, ScrollToTop, layout |
| [03_AuthContext_jsx.md](./03_AuthContext_jsx.md) | `src/context/AuthContext.jsx` | React Context, login/signup/logout, localStorage auth |
| [04_knowledgeBase_js.md](./04_knowledgeBase_js.md) | `src/data/knowledgeBase.js` | Disease classes, knowledge base, chart data |
| [05_DetectPage_jsx.md](./05_DetectPage_jsx.md) | `src/pages/DetectPage.jsx` | AI pipeline, HSV analysis, Canvas API, scoring engine |
| [06_ResultsPage_jsx.md](./06_ResultsPage_jsx.md) | `src/pages/ResultsPage.jsx` | SVG ring, prediction bars, tabs, report download |
| [07_DashboardPage_jsx.md](./07_DashboardPage_jsx.md) | `src/pages/DashboardPage.jsx` | Recharts, role-based UI, farm map, expert review |
| [08_LandingPage_jsx.md](./08_LandingPage_jsx.md) | `src/pages/LandingPage.jsx` | IntersectionObserver, animations, marquee, particles |
| [09_Auth_Pages_jsx.md](./09_Auth_Pages_jsx.md) | `LoginPage.jsx` + `SignupPage.jsx` | Controlled forms, async handlers, redirect-back |
| [10_AboutPage_jsx.md](./10_AboutPage_jsx.md) | `src/pages/AboutPage.jsx` | Data-driven static content, CSS custom properties |
| [11_Config_and_CSS.md](./11_Config_and_CSS.md) | `index.html`, `vite.config.js`, `package.json`, `index.css` | Vite setup, CSS variables, design system, animations |

---

## 🏗️ Reading Order Recommendation

If you're learning the codebase for the first time, read in this order:

```
1. index.html        → The HTML shell
2. main.jsx          → JavaScript entry point
3. App.jsx           → Router and layout structure
4. AuthContext.jsx   → Global state (needed by many files)
5. knowledgeBase.js  → All the data (needed by many files)
6. LandingPage.jsx   → Simplest page, great animation patterns
7. LoginPage.jsx     → Forms and async patterns
8. SignupPage.jsx     → Similar to Login but with more fields
9. AboutPage.jsx     → Data-driven rendering
10. DetectPage.jsx   → The most complex file — the AI engine
11. ResultsPage.jsx  → How results are displayed
12. DashboardPage.jsx → Role-based analytics
13. index.css        → Design system (can read anytime)
```

---

## 🧠 Key Concepts Summary

### React Concepts Used

| Concept | Where Used | File |
|---------|-----------|------|
| `useState` | All interactive components | All pages |
| `useEffect` | Side effects (localStorage, timers, observers) | AuthContext, ResultsPage, LandingPage |
| `useRef` | Canvas, animation tracking, file input | DetectPage, LandingPage |
| `useCallback` | Memoize file handler to prevent re-creation | DetectPage |
| `useContext` | Read auth state anywhere | All pages via `useAuth()` |
| `createContext` | Create auth broadcast channel | AuthContext |
| React Context | Avoid prop drilling for auth | AuthContext → all pages |
| Controlled Components | Form inputs synced with state | LoginPage, SignupPage |
| Conditional Rendering | `{condition && <JSX>}` | All pages |
| List Rendering | `.map()` to render arrays | All pages |
| Component Composition | Small components built into larger ones | DetectPage, DashboardPage |
| `useNavigate` | Programmatic routing | All pages |
| `useLocation` | Read current URL / previous location | LoginPage, App.jsx |

---

### JavaScript Concepts Used

| Concept | Where Used |
|---------|-----------|
| `async/await` | login(), signup(), handleAnalyze(), runInference() |
| `Promise` | All async operations in AuthContext |
| `try/catch/finally` | Form submission handlers |
| Arrow functions | All event handlers and callbacks |
| Array methods: `.map()`, `.filter()`, `.find()`, `.reduce()`, `.some()` | Throughout |
| Spread operator `{...obj}` | Immutable state updates in DashboardPage |
| Optional chaining `?.` | Safe access to nested properties |
| Short-circuit evaluation `&&` | Conditional rendering |
| Template literals `` ` ` `` | String building in report download |
| Destructuring `{ field }` | Props and object extraction |
| `URL.createObjectURL()` | Image preview, report download |
| `localStorage`, `sessionStorage` | Persistence layer |
| `IntersectionObserver` | Scroll-triggered animations |
| `requestAnimationFrame` | Smooth counter animation loop |
| Canvas API (`getImageData`) | Pixel-level image analysis |
| HSV color space math | Disease detection engine |

---

### CSS Concepts Used

| Concept | File |
|---------|------|
| CSS Custom Properties (variables) | index.css |
| `clamp()` for fluid typography | index.css |
| Flexbox layout | App.css, most components |
| CSS Grid | Features grid, dashboard, charts |
| `@keyframes` animations | index.css (fadeInUp, float, pulse) |
| `animation-delay` for stagger | LandingPage, DetectPage |
| `backdrop-filter: blur()` | Glassmorphism cards |
| `strokeDasharray/offset` | SVG confidence ring |
| `transform: translateY()` | Button hover, animations |
| `linear-gradient` | Backgrounds, text, bars |
| `drop-shadow` filter | Confidence ring glow |
| CSS custom properties passed via `style={{ '--var': value }}` | Feature cards, Farm map markers |

---

## 🔄 Data Flow Overview

```
User uploads image (DetectPage)
    ↓
analyzeImageColors(file)    →  Canvas API pixel analysis
    ↓
scoreAllGroups(colors)      →  Weighted disease group scoring
    ↓
runInference(file)          →  Selects class + builds result object
    ↓
sessionStorage.setItem()    →  Stores result for ResultsPage
localStorage.setItem()      →  Saves scan to user history
    ↓
navigate('/results')        →  React Router navigates

ResultsPage
    ↓
sessionStorage.getItem()    →  Reads result
    ↓
Renders:
  ConfidenceRing            →  SVG animated gauge
  PredictionBars            →  Top-5 probability bars
  InfoTabs                  →  Knowledge base content
  UrgencyCard               →  Severity-based action
  Download Report           →  Blob → anchor click

Dashboard
    ↓
localStorage.getItem('agriAI_global_scans')
    ↓
isExpert ?
  → ExpertAnalytics + PendingReviewsFeed
  → Recharts charts + review workflow
  :
  → WeatherWidget + FarmMap + PersonalHistory
  → Tabs, map markers, scan table
```
