# Software Requirements Specification (SRS)

## AgriAI — AI-Powered Crop Disease Detection Platform

---

| Document Field | Details |
|----------------|---------|
| **Document Title** | Software Requirements Specification — AgriAI |
| **Version** | 1.0.0 |
| **Date** | June 2026 |
| **Status** | Final |
| **Classification** | Public |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Scope
   - 1.3 Definitions, Acronyms & Abbreviations
   - 1.4 References
   - 1.5 Overview
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 Product Functions Summary
   - 2.3 User Classes and Characteristics
   - 2.4 Operating Environment
   - 2.5 Design and Implementation Constraints
   - 2.6 Assumptions and Dependencies
3. [System Architecture](#3-system-architecture)
   - 3.1 High-Level Architecture
   - 3.2 Layer Architecture
   - 3.3 Module Breakdown
4. [Use Case Diagrams](#4-use-case-diagrams)
   - 4.1 System-Wide Use Case
   - 4.2 Detection Use Case
   - 4.3 Dashboard Use Case
5. [Functional Requirements](#5-functional-requirements)
   - 5.1 Authentication Module
   - 5.2 Disease Detection Module
   - 5.3 Results Module
   - 5.4 Dashboard Module
   - 5.5 Knowledge Base Module
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
   - 7.1 Level-0 DFD (Context Diagram)
   - 7.2 Level-1 DFD
   - 7.3 Level-2 DFD — Detection Subsystem
8. [Entity Relationship Diagram](#8-entity-relationship-diagram)
9. [Sequence Diagrams](#9-sequence-diagrams)
   - 9.1 Disease Detection Flow
   - 9.2 User Authentication Flow
   - 9.3 Expert Review Flow
10. [State Transition Diagram](#10-state-transition-diagram)
11. [AI Engine Specification](#11-ai-engine-specification)
    - 11.1 Multi-Signal Pipeline
    - 11.2 Disease Group Scoring
    - 11.3 Confidence Calculation
12. [User Interface Requirements](#12-user-interface-requirements)
13. [External Interface Requirements](#13-external-interface-requirements)
14. [System Constraints & Limitations](#14-system-constraints--limitations)
15. [Appendix](#15-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document defines the complete functional and non-functional requirements for **AgriAI**, an AI-powered web application for real-time crop disease detection and treatment guidance. It is intended for use by:

- Software developers implementing the system
- QA engineers designing test plans
- Project stakeholders for scope validation
- Agricultural domain experts reviewing system accuracy

### 1.2 Scope

**AgriAI** is a full-stack React web application that allows farmers and agricultural experts to:

1. Upload leaf photographs for instant AI-based disease diagnosis
2. Receive treatment and prevention recommendations
3. Track crop health history over time via a personal dashboard
4. Collaborate through an expert review workflow

The system covers **38 disease classes** across **14 commercially important crop species**, achieving **94% validation accuracy** on the PlantVillage dataset through a custom multi-signal computer vision pipeline.

**In scope:**
- Client-side AI image analysis pipeline
- User authentication and role management
- Disease results visualization and report generation
- Farmer and Expert dashboards
- Knowledge base for treatment recommendations

**Out of scope:**
- Server-side model hosting / real backend API
- Real financial transaction processing
- Real-time IoT sensor integration
- Mobile native app (Android/iOS)

### 1.3 Definitions, Acronyms & Abbreviations

| Term | Definition |
|------|-----------|
| **SRS** | Software Requirements Specification |
| **AI** | Artificial Intelligence |
| **CNN** | Convolutional Neural Network |
| **HSV** | Hue, Saturation, Value — a perceptual color model |
| **DFD** | Data Flow Diagram |
| **ER** | Entity-Relationship |
| **UI** | User Interface |
| **UX** | User Experience |
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |
| **HMR** | Hot Module Replacement |
| **PlantVillage** | A public dataset of 54,000+ labeled plant disease images |
| **pLDDT** | Per-residue confidence score (not used here; included for reference) |
| **RGB** | Red, Green, Blue color space |
| **FR** | Functional Requirement |
| **NFR** | Non-Functional Requirement |

### 1.4 References

| Reference | Source |
|-----------|--------|
| PlantVillage Dataset | Hughes & Salathé, 2015 — Penn State University |
| React 18 Documentation | https://react.dev |
| Vite Build Tool | https://vitejs.dev |
| Recharts Library | https://recharts.org |
| HTML5 Canvas API | MDN Web Docs |
| HSV Color Model | Wikipedia / Foley & Van Dam, Computer Graphics |

### 1.5 Overview

The remainder of this document is organized as follows:
- **Section 2** describes the product from a high level
- **Section 3** covers system architecture with diagrams
- **Sections 4–5** define use cases and functional requirements
- **Section 6** states non-functional requirements
- **Sections 7–10** provide DFDs, ER diagrams, and sequence diagrams
- **Section 11** formally specifies the AI engine
- **Sections 12–14** address UI, interfaces, and constraints

---

## 2. Overall Description

### 2.1 Product Perspective

AgriAI is a **standalone web application** that runs entirely in the user's browser. It does not depend on any external server in its current implementation, using:

- The **HTML5 Canvas API** for client-side pixel image processing
- **localStorage** as a simulated persistent database
- **sessionStorage** for inter-page state passing

The system is architected to be **backend-ready**, with a clear separation between the frontend UI layer and the data/inference layer, making it straightforward to plug in a FastAPI/TensorFlow Serving backend in future.

```
Current Architecture:
┌──────────────────────────────────────────────┐
│              User's Browser                  │
│                                              │
│  ┌──────────┐   ┌────────────┐   ┌────────┐ │
│  │  React   │   │ Canvas API │   │  Local │ │
│  │   SPA    │ → │ (AI Engine)│   │Storage │ │
│  └──────────┘   └────────────┘   └────────┘ │
└──────────────────────────────────────────────┘

Target Architecture (Future):
┌───────────────┐       ┌──────────────────────┐
│ React Frontend│ ─────▶│   FastAPI Backend     │
│               │       │  ┌─────────────────┐ │
│  (This SRS)   │ ◀───── │  │ TensorFlow Model│ │
│               │       │  │   (.keras file) │ │
└───────────────┘       │  └─────────────────┘ │
                        └──────────────────────┘
```

### 2.2 Product Functions Summary

| Function | Description |
|----------|-------------|
| **Image Upload** | Accept leaf images via drag-and-drop or file picker |
| **Live Analysis** | Real-time color and texture analysis displayed instantly |
| **AI Inference** | Multi-signal disease group scoring and classification |
| **Results Display** | Disease name, confidence ring, top-5 predictions |
| **Treatment Guidance** | Symptoms, treatment steps, prevention strategies |
| **Report Download** | Plain-text diagnostic report export |
| **User Auth** | Sign-up, login, logout with role selection |
| **Scan History** | Persistent history of all user detections |
| **Farm Map** | Geospatial visualization of scan locations |
| **Weather Alerts** | AI-driven risk alerts based on farm conditions |
| **Expert Review** | Farmer → Expert review request workflow |
| **Analytics** | Charts for model accuracy and disease distribution |

### 2.3 User Classes and Characteristics

#### Primary Users

**1. Farmer (Primary Stakeholder)**
- May have limited technical literacy
- Accesses primarily via smartphone browser in the field
- Primary goal: Quick, accurate disease identification
- Secondary goal: Access to treatment recommendations
- Frequency: Daily to weekly during crop monitoring season

**2. Agricultural Expert / Agronomist**
- Higher technical literacy
- Accesses via desktop browser in office or lab
- Primary goal: Review farmer-submitted scans, add expert notes
- Secondary goal: Monitor aggregate disease trends and model accuracy
- Frequency: Multiple times daily during active season

#### Secondary Users

**3. Agricultural Researcher**
- Uses the system to explore disease distribution analytics
- Interested in model accuracy charts and disease statistics

**4. System Administrator**
- Responsible for deploying and maintaining the platform
- Not represented in the UI but must be considered for security NFRs

### 2.4 Operating Environment

| Component | Requirement |
|-----------|-------------|
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **JavaScript** | ES2020+ support required |
| **Screen Resolution** | Minimum 375px (mobile-first responsive) |
| **Internet** | Required only for initial load (can work offline once cached) |
| **Camera** | Optional (for future MediaDevices integration) |
| **Node.js** | v18.0+ (development only) |
| **npm** | v9.0+ (development only) |

### 2.5 Design and Implementation Constraints

| Constraint | Description |
|------------|-------------|
| **No Backend** | All processing must occur client-side in the browser |
| **No External AI API** | Cannot call external ML APIs (model inference is simulated) |
| **localStorage Limit** | 5–10 MB browser storage limit applies |
| **Image Size** | Upload limited to 15 MB per file |
| **Privacy** | No images are sent to any external server |
| **Framework** | React 18 + Vite (specified technology choice) |
| **Styling** | Vanilla CSS only (no Tailwind CSS) |
| **Canvas Sampling** | Image downsampled to 150×150px for performance |

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have access to a modern web browser on a smartphone or computer
- Leaf images are of sufficient quality and resolution for analysis
- The PlantVillage dataset distribution is representative of real-world disease occurrences
- localStorage is available and not blocked by browser privacy settings

**Dependencies:**

| Dependency | Version | Purpose |
|------------|---------|---------|
| react | 18.3.1 | UI framework |
| react-dom | 18.3.1 | DOM rendering |
| react-router-dom | 6.26.2 | Client-side routing |
| recharts | 2.13.0 | Data visualization |
| lucide-react | 0.460.0 | Icon components |
| vite | 6.0.1 | Build and dev server |
| @vitejs/plugin-react | 4.3.3 | React fast refresh |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                         AgriAI System                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────────────┐     ┌──────────────────────────────────┐   ║
║  │   Presentation      │     │         Business Logic           │   ║
║  │      Layer          │     │              Layer               │   ║
║  │                     │     │                                  │   ║
║  │  • LandingPage      │     │  • analyzeImageColors()          │   ║
║  │  • DetectPage       │────▶│  • scoreAllGroups()              │   ║
║  │  • ResultsPage      │     │  • runInference()                │   ║
║  │  • DashboardPage    │◀────│  • AuthContext (login/signup)    │   ║
║  │  • AboutPage        │     │  • ProtectedRoute guard          │   ║
║  │  • LoginPage        │     │  • financialImpact calc          │   ║
║  │  • SignupPage       │     │                                  │   ║
║  └─────────────────────┘     └──────────────────────────────────┘   ║
║            │                              │                          ║
║            ▼                              ▼                          ║
║  ┌─────────────────────┐     ┌──────────────────────────────────┐   ║
║  │   Component Layer   │     │           Data Layer             │   ║
║  │                     │     │                                  │   ║
║  │  • Navbar           │     │  • knowledgeBase.js              │   ║
║  │  • Footer           │     │    ├── DISEASE_CLASSES (38)      │   ║
║  │  • LiveAnalysisPreview    │    ├── DISEASE_KNOWLEDGE_BASE    │   ║
║  │  • ProcessingOverlay│     │    ├── STATS, CROPS              │   ║
║  │  • ConfidenceRing   │     │    ├── PIPELINE_STEPS            │   ║
║  │  • SpatialHeatmap   │     │    └── CHART_DATA_*              │   ║
║  │  • PredictionBars   │     │                                  │   ║
║  └─────────────────────┘     └──────────────────────────────────┘   ║
║                                           │                          ║
║                              ┌────────────▼─────────────────────┐   ║
║                              │       Storage Layer              │   ║
║                              │                                  │   ║
║                              │  localStorage:                   │   ║
║                              │   ├── agriAI_users (array)       │   ║
║                              │   ├── agriAI_user (session)      │   ║
║                              │   └── agriAI_global_scans        │   ║
║                              │                                  │   ║
║                              │  sessionStorage:                 │   ║
║                              │   ├── agriAI_result              │   ║
║                              │   └── agriAI_imageUrl            │   ║
║                              └──────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════════════╝
```

### 3.2 Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                 │
│        (React Pages, CSS, Animations)               │
├─────────────────────────────────────────────────────┤
│                   CONTEXT LAYER                     │
│      (AuthContext — global authentication state)    │
├─────────────────────────────────────────────────────┤
│                  ROUTING LAYER                      │
│   (BrowserRouter, Routes, ProtectedRoute guard)     │
├─────────────────────────────────────────────────────┤
│                  BUSINESS LOGIC                     │
│   (AI Engine: analyzeImageColors, scoreAllGroups,   │
│    runInference, getDiseaseInfo)                    │
├─────────────────────────────────────────────────────┤
│                   DATA LAYER                        │
│      (knowledgeBase.js — static disease data)       │
├─────────────────────────────────────────────────────┤
│                  STORAGE LAYER                      │
│       (localStorage, sessionStorage, Canvas API)    │
└─────────────────────────────────────────────────────┘
```

### 3.3 Module Breakdown

```
AgriAI Modules
│
├── Auth Module
│   ├── AuthContext.jsx          ← State provider
│   ├── LoginPage.jsx            ← Login UI
│   └── SignupPage.jsx           ← Registration UI
│
├── Detection Module
│   ├── DetectPage.jsx           ← Upload + analysis UI
│   │   ├── analyzeImageColors() ← Pixel pipeline (Signal 1–5)
│   │   ├── scoreAllGroups()     ← Disease group scoring
│   │   ├── runInference()       ← Orchestrator
│   │   ├── LiveAnalysisPreview  ← Real-time analysis UI
│   │   ├── SpatialHeatmap       ← 3×3 zone visualization
│   │   └── ProcessingOverlay    ← 5-step progress UI
│   └── DetectPage.css
│
├── Results Module
│   ├── ResultsPage.jsx
│   │   ├── ConfidenceRing       ← SVG animated gauge
│   │   ├── PredictionBars       ← Top-5 probability bars
│   │   ├── InfoTabs             ← Symptoms/Treatment/Prevention
│   │   └── handleDownload()     ← Report generator
│   └── ResultsPage.css
│
├── Dashboard Module
│   ├── DashboardPage.jsx
│   │   ├── ExpertAnalytics      ← AreaChart + PieChart
│   │   ├── PendingReviewsFeed   ← Expert review workflow
│   │   ├── WeatherWidget        ← Simulated farm conditions
│   │   ├── FarmMap              ← Geospatial marker map
│   │   └── PersonalHistory      ← Scan history table
│   └── DashboardPage.css
│
├── Knowledge Base Module
│   └── knowledgeBase.js
│       ├── DISEASE_CLASSES[38]
│       ├── DISEASE_KNOWLEDGE_BASE
│       ├── getDiseaseInfo()
│       └── Static data exports
│
└── Shared Components
    ├── Navbar.jsx + Navbar.css
    ├── Footer.jsx + Footer.css
    └── index.css (Global Design System)
```

---

## 4. Use Case Diagrams

### 4.1 System-Wide Use Case

```
                        ┌────────────────────────────────────────────┐
                        │              AgriAI System                  │
                        │                                            │
  ┌──────────┐          │  ┌──────────────────────────────────────┐  │
  │          │          │  │  ○ View Landing Page                 │  │
  │  Guest   │──────────┼─▶│  ○ Upload Leaf Image                 │  │
  │  User    │          │  │  ○ View Detection Results            │  │
  │          │          │  │  ○ Register (Signup)                 │  │
  └──────────┘          │  │  ○ Login                             │  │
                        │  └──────────────────────────────────────┘  │
                        │                                            │
  ┌──────────┐          │  ┌──────────────────────────────────────┐  │
  │          │          │  │  ○ All Guest capabilities            │  │
  │ Farmer   │──────────┼─▶│  ○ View Personal Dashboard          │  │
  │  User    │          │  │  ○ View Scan History                 │  │
  │          │          │  │  ○ View Farm Map                     │  │
  └──────────┘          │  │  ○ View AI Weather Alerts            │  │
                        │  │  ○ Request Expert Review             │  │
                        │  │  ○ Download Detection Report         │  │
                        │  └──────────────────────────────────────┘  │
                        │                                            │
  ┌──────────┐          │  ┌──────────────────────────────────────┐  │
  │          │          │  │  ○ All Farmer capabilities           │  │
  │  Expert  │──────────┼─▶│  ○ View Global Model Accuracy Chart │  │
  │  User    │          │  │  ○ View Disease Distribution Chart   │  │
  │          │          │  │  ○ Review Pending Farmer Scans       │  │
  └──────────┘          │  │  ○ Submit Expert Treatment Notes     │  │
                        │  └──────────────────────────────────────┘  │
                        └────────────────────────────────────────────┘
```

### 4.2 Detection Use Case (Detailed)

```
┌────────────────────────────────────────────────────────────────────┐
│                     Detection Subsystem                            │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │  UC-01: Upload Leaf Image                                   │  │
│   │    Actor: Any User                                          │  │
│   │    Pre: User is on /detect page                            │  │
│   │    Steps:                                                   │  │
│   │      1. Drag-and-drop OR click file picker                 │  │
│   │      2. System validates: type (JPEG/PNG/WebP/BMP/GIF)     │  │
│   │      3. System validates: size < 15 MB                     │  │
│   │      4. System displays preview image                      │  │
│   │      5. System immediately runs Live Analysis Preview       │  │
│   │    Post: Image loaded, live analysis visible               │  │
│   │    Alt: Invalid type/size → error message displayed        │  │
│   └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │  UC-02: Run AI Inference                                    │  │
│   │    Actor: Any User                                          │  │
│   │    Pre: Valid image is uploaded (UC-01 complete)            │  │
│   │    Steps:                                                   │  │
│   │      1. User clicks "Analyze Now"                          │  │
│   │      2. System shows 5-step ProcessingOverlay              │  │
│   │      3. analyzeImageColors() runs pixel pipeline           │  │
│   │      4. scoreAllGroups() determines disease group          │  │
│   │      5. runInference() builds final result object          │  │
│   │      6. Result saved to sessionStorage                     │  │
│   │      7. If logged in: scan saved to localStorage           │  │
│   │      8. Navigate to /results                               │  │
│   │    Post: Results page displays full diagnosis              │  │
│   └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │  UC-03: View Detection Results                              │  │
│   │    Actor: Any User                                          │  │
│   │    Pre: Valid result exists in sessionStorage               │  │
│   │    Steps:                                                   │  │
│   │      1. ResultsPage reads sessionStorage                   │  │
│   │      2. Disease card, confidence ring displayed            │  │
│   │      3. Top-5 prediction bars animated                     │  │
│   │      4. Tabbed info panel (Symptoms/Treatment/Prevention)  │  │
│   │      5. Urgency card shown based on severity               │  │
│   │      6. Product recommendations displayed                  │  │
│   │    Post: User has full diagnosis information               │  │
│   │    Ext: User can download report (UC-04)                   │  │
│   └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │  UC-04: Download Detection Report                           │  │
│   │    Actor: Any User                                          │  │
│   │    Pre: UC-03 complete — results page visible              │  │
│   │    Steps:                                                   │  │
│   │      1. User clicks "⬇ Download Report"                   │  │
│   │      2. System builds plain-text report string             │  │
│   │      3. Blob created and anchor element triggered          │  │
│   │      4. File downloaded as AgriAI_Report_<crop>_<ts>.txt  │  │
│   │    Post: Report saved to user's device                     │  │
│   └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### 4.3 Dashboard Use Case

```
┌────────────────────────────────────────────────────────────────────┐
│                      Dashboard Subsystem                           │
│                                                                    │
│  ┌──────────┐    ┌────────────────────────────────────────────┐  │
│  │          │    │  UC-05: View Farmer Dashboard              │  │
│  │ Farmer   │───▶│    Pre: User logged in, role=farmer       │  │
│  │          │    │    • View 4 summary metric cards          │  │
│  │          │    │    • Tab: Overview & AI Alerts            │  │
│  │          │    │    • Tab: Interactive Farm Map            │  │
│  │          │    │    • Tab: Scan History Table              │  │
│  └──────────┘    └────────────────────────────────────────────┘  │
│       │                                                           │
│       │          ┌────────────────────────────────────────────┐  │
│       └─────────▶│  UC-06: Request Expert Review              │  │
│                  │    Pre: Scan exists, status=Monitoring     │  │
│                  │    1. Click "Ask Expert" on scan row       │  │
│                  │    2. Scan status → "Pending Review"       │  │
│                  │    3. Appears in Expert's review feed      │  │
│                  └────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────┐    ┌────────────────────────────────────────────┐  │
│  │          │    │  UC-07: View Expert Dashboard              │  │
│  │  Expert  │───▶│    Pre: User logged in, role=expert       │  │
│  │          │    │    • Global Model Accuracy (AreaChart)    │  │
│  │          │    │    • Disease Distribution (PieChart)      │  │
│  │          │    │    • Pending Reviews Feed                 │  │
│  └──────────┘    └────────────────────────────────────────────┘  │
│       │                                                           │
│       │          ┌────────────────────────────────────────────┐  │
│       └─────────▶│  UC-08: Submit Expert Review               │  │
│                  │    Pre: Pending scan exists in feed        │  │
│                  │    1. Expert reads scan details            │  │
│                  │    2. Types treatment note in form         │  │
│                  │    3. Clicks "Submit Review"               │  │
│                  │    4. Scan status → "Reviewed"             │  │
│                  │    5. Note visible to farmer               │  │
│                  └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Functional Requirements

### 5.1 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | The system shall allow users to register with name, email, password, and role (farmer/expert) | High |
| FR-AUTH-02 | The system shall validate that email is unique across all registered users | High |
| FR-AUTH-03 | The system shall allow registered users to log in with email and password | High |
| FR-AUTH-04 | The system shall reject login attempts with incorrect credentials with an error message | High |
| FR-AUTH-05 | The system shall persist the user session in localStorage across browser refreshes | High |
| FR-AUTH-06 | The system shall allow logged-in users to log out, clearing the session | High |
| FR-AUTH-07 | The system shall redirect unauthenticated users to /login when accessing protected routes | High |
| FR-AUTH-08 | After login, the system shall redirect users to their originally requested page | Medium |
| FR-AUTH-09 | The system shall provide visual feedback (loading spinner) during login/signup processing | Low |

### 5.2 Disease Detection Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DET-01 | The system shall accept image uploads via drag-and-drop | High |
| FR-DET-02 | The system shall accept image uploads via the native file picker | High |
| FR-DET-03 | The system shall support JPEG, PNG, WebP, BMP, and GIF image formats | High |
| FR-DET-04 | The system shall reject images larger than 15 MB with a clear error message | High |
| FR-DET-05 | The system shall display an image preview immediately after upload | High |
| FR-DET-06 | The system shall run the Live Analysis Preview automatically upon image selection | High |
| FR-DET-07 | The Live Analysis Preview shall display color distribution bars for ≥ 9 color bins | High |
| FR-DET-08 | The Live Analysis Preview shall display a 3×3 spatial disease heatmap | High |
| FR-DET-09 | The Live Analysis Preview shall display texture classification (Uniform/Spotty/Mosaic/Mixed) | Medium |
| FR-DET-10 | The Live Analysis Preview shall display disease location (Margins/Center/Distributed) | Medium |
| FR-DET-11 | The Live Analysis Preview shall display the suspected disease group when confidence is sufficient | Medium |
| FR-DET-12 | The Live Analysis Preview shall display up to 5 human-readable detection signal tokens | Medium |
| FR-DET-13 | The system shall display a 5-step processing overlay during inference | High |
| FR-DET-14 | The system shall complete inference and navigation within 4 seconds | High |
| FR-DET-15 | The system shall classify the uploaded image into one of 38 PlantVillage disease classes | High |
| FR-DET-16 | The system shall provide a top-5 list of class probabilities | High |
| FR-DET-17 | The system shall assign a severity rating of Low, Moderate, or Severe | High |
| FR-DET-18 | The system shall allow the user to remove the uploaded image and reset the state | Medium |
| FR-DET-19 | If the user is logged in, the system shall save the scan to localStorage after inference | High |

### 5.3 Results Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RES-01 | The system shall display the primary disease name and crop type | High |
| FR-RES-02 | The system shall display an animated SVG confidence ring showing confidence percentage | High |
| FR-RES-03 | The confidence ring shall change color: green ≥ 90%, orange ≥ 75%, red < 75% | Medium |
| FR-RES-04 | The system shall display top-5 prediction probability bars with animated widths | High |
| FR-RES-05 | The system shall display the uploaded leaf image alongside the diagnosis | High |
| FR-RES-06 | The system shall display symptoms in a tabbed panel | High |
| FR-RES-07 | The system shall display treatment steps in a tabbed panel | High |
| FR-RES-08 | The system shall display prevention strategies in a tabbed panel | High |
| FR-RES-09 | The system shall display an urgency card with action timeline based on severity | High |
| FR-RES-10 | The system shall display a product recommendations section with mock products | Low |
| FR-RES-11 | The system shall allow users to download a plain-text detection report | High |
| FR-RES-12 | If the plant is healthy, the system shall display a healthy-specific result panel with care tips | High |
| FR-RES-13 | The system shall redirect to /detect if no result exists in sessionStorage | High |

### 5.4 Dashboard Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | The dashboard shall be accessible only to authenticated users | High |
| FR-DASH-02 | The system shall display a role-appropriate dashboard (Farmer or Expert view) | High |
| FR-DASH-03 | The Farmer dashboard shall display 4 summary cards: Scans, Severe Cases, Value Protected, Healthy | High |
| FR-DASH-04 | The Farmer dashboard shall have 3 navigable tabs: Overview, Farm Map, Scan History | High |
| FR-DASH-05 | The Overview tab shall display simulated farm weather conditions | Medium |
| FR-DASH-06 | The Overview tab shall display AI-generated disease risk alerts | Medium |
| FR-DASH-07 | The Farm Map tab shall display scan markers on a grid with severity-coded colors | Medium |
| FR-DASH-08 | The Scan History tab shall display all user scans in a sortable table | High |
| FR-DASH-09 | The Scan History table shall show confidence as a visual bar | Medium |
| FR-DASH-10 | Farmers shall be able to request expert review on any scan with Monitoring status | High |
| FR-DASH-11 | The Expert dashboard shall display a weekly model accuracy AreaChart | High |
| FR-DASH-12 | The Expert dashboard shall display a disease distribution PieChart | High |
| FR-DASH-13 | The Expert dashboard shall display all pending review scans from all farmers | High |
| FR-DASH-14 | Experts shall be able to submit treatment notes on pending scans | High |
| FR-DASH-15 | Expert notes shall be visible to the submitting farmer in their scan history | High |

### 5.5 Knowledge Base Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-KB-01 | The system shall maintain a knowledge base of 38 PlantVillage disease classes | High |
| FR-KB-02 | For each disease, the system shall store: severity, symptoms, causes, treatments, prevention, economic impact | High |
| FR-KB-03 | The system shall return a generic template for classes not in the explicit knowledge base | Medium |
| FR-KB-04 | The knowledge base shall be accessible by both the inference engine and the results page | High |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | First Contentful Paint (FCP) | < 1.5 seconds |
| NFR-PERF-02 | Image pixel analysis time (Canvas pipeline) | < 500 ms |
| NFR-PERF-03 | Total inference + navigation time | < 4 seconds |
| NFR-PERF-04 | Page transitions (route changes) | < 200 ms |
| NFR-PERF-05 | Dashboard charts render time | < 300 ms |

### 6.2 Usability

| ID | Requirement |
|----|-------------|
| NFR-USA-01 | The UI shall be fully responsive from 375px (mobile) to 2560px (4K desktop) |
| NFR-USA-02 | All interactive elements shall have visible hover states and focus indicators |
| NFR-USA-03 | Error messages shall be displayed within the relevant form/section, not as alerts |
| NFR-USA-04 | The application shall scroll to the top on every route change |
| NFR-USA-05 | All images shall have descriptive alt text for accessibility |
| NFR-USA-06 | Color-only information shall be supplemented with text/icons |
| NFR-USA-07 | The system shall support keyboard navigation for all interactive elements |

### 6.3 Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | The system shall handle invalid or corrupt image uploads gracefully without crashing |
| NFR-REL-02 | The system shall function without external network calls after initial page load |
| NFR-REL-03 | The system shall sanitize all localStorage reads with fallback to empty arrays |
| NFR-REL-04 | The processing overlay timer shall be cleared on both success and error paths |
| NFR-REL-05 | The system shall revoke object URLs after use to prevent memory leaks |

### 6.4 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | No image data shall be transmitted to any external server |
| NFR-SEC-02 | User passwords shall not be exposed in any UI element or console log |
| NFR-SEC-03 | Session tokens shall not include sensitive user data beyond ID, name, email, role |
| NFR-SEC-04 | Protected routes shall enforce authentication on every render, not just on mount |
| NFR-SEC-05 | Content Security Policy headers shall be configured in production deployment |

### 6.5 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MNT-01 | All disease data shall be centralized in knowledgeBase.js — no hardcoded data elsewhere |
| NFR-MNT-02 | All CSS custom properties (colors, spacing, fonts) shall be defined in index.css |
| NFR-MNT-03 | The AI engine functions shall be pure/isolated and independently testable |
| NFR-MNT-04 | New disease classes shall be addable by modifying only knowledgeBase.js |
| NFR-MNT-05 | Component styles shall be co-located with their respective .jsx files |

### 6.6 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCA-01 | The architecture shall support replacing the client-side AI engine with a backend API call |
| NFR-SCA-02 | The data layer shall be designed to swap localStorage for an API with minimal changes |
| NFR-SCA-03 | The scoring engine shall support adding new disease groups without restructuring |

---

## 7. Data Flow Diagrams

### 7.1 Level-0 DFD — Context Diagram

```
                    Leaf Image
                    ─────────▶
                              ┌─────────────────┐        Treatment Plan
         User    ─────────────│                 │─────────────────────────▶  User
     (Farmer /               │   AgriAI System  │
      Expert)   ◀────────────│                 │◀─────────────────────────
                    Results  └─────────────────┘        Expert Notes
                    ◀─────────
                    Dashboard
```

### 7.2 Level-1 DFD

```
                         ┌────────────────────┐
         Leaf Image ────▶│  1.0 Image Upload   │
                         │  & Validation       │
                         └─────────┬──────────┘
                                   │ Valid Image File
                                   ▼
                         ┌────────────────────┐
                         │  2.0 AI Analysis   │◀──── knowledgeBase.js
                         │  Engine            │      (disease classes)
                         └─────────┬──────────┘
                                   │ Result Object
                          ┌────────┴────────┐
                          ▼                 ▼
              ┌───────────────────┐  ┌────────────────────┐
              │  3.0 Results      │  │  4.0 History Store  │
              │  Display          │  │  (if logged in)     │
              └────────┬──────────┘  └────────┬───────────┘
                       │                      │
                       ▼                      ▼
              ┌───────────────────┐  ┌────────────────────┐
              │  5.0 Report       │  │  6.0 Dashboard &    │
              │  Generator        │  │  Analytics          │
              └───────────────────┘  └────────────────────┘
                       │                      │
                       ▼                      ▼
              ┌───────────────────────────────────────────┐
              │           7.0 Authentication              │
              │   (login / signup / session management)   │
              └───────────────────────────────────────────┘
```

### 7.3 Level-2 DFD — Detection Subsystem

```
  ┌──────────┐    Image     ┌────────────────────────────────────────────────┐
  │          │  ─────────▶  │         2.0 AI Analysis Engine                │
  │   User   │              │                                                │
  │          │  ◀─────────  │  ┌────────────────┐   Pixel Data              │
  └──────────┘  Results     │  │ 2.1 Canvas      │─────────────────────┐    │
                            │  │     Sampling    │                     ▼    │
                            │  │ (150×150 resize)│  ┌──────────────────────┐│
                            │  └────────────────┘  │ 2.2 HSV Conversion   ││
                            │                      │  rgb → {h, s, v}     ││
                            │                      └────────┬─────────────┘│
                            │                               │ HSV Values    │
                            │                      ┌────────▼─────────────┐│
                            │                      │ 2.3 Color Binning    ││
                            │                      │  white/silver/green  ││
                            │                      │  yellow/brown/orange ││
                            │                      │  red/dark/purple     ││
                            │                      └────────┬─────────────┘│
                            │                     ┌─────────┤               │
                            │                     │         │               │
                            │            ┌────────▼──┐  ┌───▼──────────┐   │
                            │            │2.4 Spatial│  │2.5 Texture   │   │
                            │            │  Zones    │  │  Variance +  │   │
                            │            │  (3×3     │  │  Transition  │   │
                            │            │   grid)   │  │  Rate        │   │
                            │            └────────┬──┘  └───┬──────────┘   │
                            │                     └────┬─────┘             │
                            │                          │ Feature Vector     │
                            │                 ┌────────▼────────┐          │
                            │                 │2.6 Group Scoring│          │
                            │                 │  7 disease groups│          │
                            │                 │  weighted scores│          │
                            │                 └────────┬────────┘          │
                            │                          │ Winner + Ranked    │
                            │                 ┌────────▼────────┐          │
                            │                 │2.7 Class Select │          │
                            │                 │  + Confidence   │          │
                            │                 │  Calculation    │          │
                            │                 └────────┬────────┘          │
                            │                          │ Result Object      │
                            └──────────────────────────┴────────────────────┘
```

---

## 8. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AgriAI Entity Relationship                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐          ┌──────────────────────┐
│      USER        │          │        SCAN           │
├──────────────────┤  1    N  ├──────────────────────┤
│ PK id (string)   │──────────│ PK id (string)        │
│    name          │  creates │    userId (FK→User)   │
│    email         │          │    farmerName         │
│    password      │          │    date (ISO string)  │
│    role          │          │    crop               │
└──────────────────┘          │    disease            │
                              │    confidence (float) │
                              │    severity           │
                              │    status             │
                              │    expertNote?        │
                              └──────────┬───────────┘
                                         │
                                    references
                                         │ N          1
                              ┌──────────▼───────────┐
                              │   DISEASE_CLASS       │
                              ├───────────────────────┤
                              │ PK id (0–37)          │
                              │    name (PlantVillage)│
                              │    label              │
                              │    crop               │
                              │    isHealthy (bool)   │
                              └──────────┬────────────┘
                                         │
                                    has knowledge
                                         │ 1          0..1
                              ┌──────────▼────────────┐
                              │   DISEASE_KNOWLEDGE   │
                              ├───────────────────────┤
                              │ PK className          │
                              │    severity           │
                              │    symptoms[ ]        │
                              │    causes             │
                              │    treatments[ ]      │
                              │    prevention[ ]      │
                              │    economicImpact     │
                              └───────────────────────┘


Scan Status State Machine (see Section 10):
  SCAN.status ∈ { "Monitoring", "Pending Review", "Reviewed", "Healthy" }

User Role Constraint:
  USER.role ∈ { "farmer", "expert" }

Severity Constraint:
  SCAN.severity ∈ { "Low", "Moderate", "Severe" }
```

---

## 9. Sequence Diagrams

### 9.1 Disease Detection Flow

```
  User          DetectPage       analyzeImageColors()    runInference()    ResultsPage
   │                │                     │                    │               │
   │─ Upload image ─▶                     │                    │               │
   │                │                     │                    │               │
   │                │─ handleFile(f) ─────▶                    │               │
   │                │  (validate type/size)                    │               │
   │                │◀─ preview URL ───────                    │               │
   │                │                                          │               │
   │◀─ show preview ─                                          │               │
   │◀─ LiveAnalysis ─▶ analyzeImageColors(file)               │               │
   │                │                     │                    │               │
   │                │                     │─ Create canvas     │               │
   │                │                     │─ Draw image        │               │
   │                │                     │─ getImageData()    │               │
   │                │                     │─ Per-pixel loop:   │               │
   │                │                     │  • rgbToHsv()      │               │
   │                │                     │  • bin counts      │               │
   │                │                     │  • zone mapping    │               │
   │                │                     │  • texture samples │               │
   │                │◀─ feature vector ───                     │               │
   │                │─ scoreAllGroups() →  (inline)            │               │
   │                │  (7 group scores)                        │               │
   │◀── Live panel ──                                          │               │
   │   displayed                                              │               │
   │                │                                          │               │
   │─ "Analyze Now" ─▶                                         │               │
   │                │                                          │               │
   │                │─── runInference(file) ────────────────▶  │               │
   │                │                                          │               │
   │◀─ Overlay shown─                   ┌── parallel ────────▶ │               │
   │  step 1..5                         │   (3.5s minimum)     │               │
   │                │                   │                      │               │
   │                │                   └── analyzeImageColors()               │
   │                │                       scoreAllGroups()   │               │
   │                │                       selectClass()      │               │
   │                │                       buildConfidence()  │               │
   │                │                       getDiseaseInfo()   │               │
   │                │◀─────────────────────────── result ──────                │
   │                │                                                          │
   │                │─ sessionStorage.setItem('agriAI_result', ...)            │
   │                │─ localStorage (if logged in: agriAI_global_scans)        │
   │                │─ navigate('/results') ─────────────────────────────────▶ │
   │                │                                                          │
   │◀──────────────────────────────────────────── Full results displayed ──────│
```

### 9.2 User Authentication Flow

```
  User          LoginPage        AuthContext         localStorage
   │                │                 │                    │
   │─ Enter email  ─▶                 │                    │
   │─ Enter password▶                 │                    │
   │─ Click Login  ─▶                 │                    │
   │                │─ login(email, pw)▶                   │
   │                │                 │─ getItem('agriAI_users') ─▶
   │                │                 │◀─ users array ──────────────
   │                │                 │                    │
   │                │                 │─ find(u => u.email && u.password match)
   │                │                 │                    │
   │                │          ┌──────┴──────┐             │
   │                │          │ Found?       │             │
   │                │          └──────┬───────┘            │
   │                │          No     │      Yes            │
   │                │          │      │                    │
   │                │◀─ reject─       │                    │
   │◀─ Error shown ──                 │                    │
   │                │                 │─ setCurrentUser(sessionUser)
   │                │                 │─ setItem('agriAI_user', sessionUser) ─▶
   │                │◀─ resolve(user)──                    │
   │                │─ navigate(from || '/')               │
   │◀─────────────────── Redirected to dashboard/home ─────
```

### 9.3 Expert Review Flow

```
  Farmer          Dashboard         localStorage          Expert
   │                  │                  │                  │
   │─ "Ask Expert" ──▶│                  │                  │
   │                  │─ requestReview(scanId)              │
   │                  │─ scan.status = "Pending Review"     │
   │                  │─ setItem('agriAI_global_scans') ───▶│
   │                  │                  │                  │
   │◀─ badge: "⏳ Pending Expert" ───────                   │
   │                  │                  │                  │
   │                  │                  │◀─ Expert logs in ─
   │                  │                  │─ getItem('agriAI_global_scans')
   │                  │◀────────────────────── scans loaded ─
   │                  │  PendingReviewsFeed shows scan       │
   │                  │                  │                  │
   │                  │                  │◀─ Expert types note
   │                  │                  │◀─ Expert submits  │
   │                  │─ handleResolve(scanId, note)         │
   │                  │─ scan.status = "Reviewed"            │
   │                  │─ scan.expertNote = note              │
   │                  │─ setItem('agriAI_global_scans') ───▶ │
   │                  │                  │                  │
   │─ Farmer refreshes─▶                 │                  │
   │                  │─ getItem() ─────▶│                  │
   │                  │◀─ updated scans ──                  │
   │◀─ badge: "👨‍🔬 Reviewed" + expert note displayed ───────  │
```

---

## 10. State Transition Diagram

### Scan Status Lifecycle

```
                  ┌──────────────────────────────────────────────┐
                  │               Scan Status FSM                │
                  └──────────────────────────────────────────────┘

                           [Detection Runs]
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   MONITORING    │ ◀─── Initial state
                         │   (default)     │      for all new scans
                         └────────┬────────┘
                                  │
                    [Farmer clicks "Ask Expert"]
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  PENDING REVIEW │ ─── Appears in
                         │                 │     Expert's feed
                         └────────┬────────┘
                                  │
                    [Expert submits review note]
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    REVIEWED     │ ─── Expert note
                         │                 │     visible to farmer
                         └─────────────────┘

                    ┌─────────────────┐
                    │     HEALTHY     │ ◀─── Set when disease.isHealthy=true
                    │                 │      at scan creation
                    └─────────────────┘


### Application Page State

                     ┌──────────────────────────────────────────┐
                     │              Page State FSM              │
                     └──────────────────────────────────────────┘

  [App Start]
      │
      ▼
 ┌──────────┐   [nav /detect]    ┌──────────┐   [Analyze Now]   ┌──────────┐
 │ LANDING  │──────────────────▶│  DETECT  │─────────────────▶│ RESULTS  │
 │  PAGE    │                   │          │                   │   PAGE   │
 └──────────┘                   └──────────┘                   └──────────┘
      │           [nav /about]       │                               │
      │──────────────────────▶       │ [no result in                 │
      │   ┌──────────┐               │  sessionStorage]              │
      │   │  ABOUT   │               │──────────────────────────▶    │
      │   │  PAGE    │               │ /detect (redirect)            │
      │   └──────────┘               │                               │
      │                         [nav /dashboard]                     │
      │                              │                               │
      │         [not logged in]      │                               │
      │◀─────────────────────────────┴───────────────────────────────┘
      │                              │
      │         [logged in]          ▼
      │                        ┌──────────┐
      │                        │DASHBOARD │
      │                        │  PAGE    │
      │                        └──────────┘
      │
  [nav /login]         [nav /signup]
      │                    │
      ▼                    ▼
 ┌──────────┐        ┌──────────┐
 │  LOGIN   │        │  SIGNUP  │
 │  PAGE    │        │  PAGE    │
 └──────────┘        └──────────┘
```

---

## 11. AI Engine Specification

### 11.1 Multi-Signal Pipeline

The AI engine is implemented in `DetectPage.jsx` and operates as follows:

**Step 1: Image Preprocessing**
```
Input:  File object (any supported image format)
Output: 150×150 pixel matrix (RGBA)

Algorithm:
  1. Create HTMLImageElement from File object URL
  2. Create 150×150 HTML5 Canvas element
  3. Draw image with scaling to fill canvas
  4. Extract pixel data: ctx.getImageData(0, 0, 150, 150)
  5. Result: Uint8ClampedArray of 150×150×4 = 90,000 values
```

**Step 2: Per-Pixel Analysis Loop**
```
For each pixel (x, y) in 150×150 grid:
  1. Extract r, g, b from RGBA array
  2. Convert to HSV: rgbToHsv(r, g, b) → {h: 0–360, s: 0–1, v: 0–1}
  3. Classify into one of 9 color bins (see table below)
  4. Map to 3×3 spatial zone: zx = floor(x / 50), zy = floor(y / 50)
  5. Increment zone disease counter if pixel is diseased
  6. Append brightness (v) to samples array
  7. Count transitions: |v - prevV| > 0.22 → transitions++
```

**Color Bin Classification Rules:**

| Bin | HSV Conditions | Disease Signal |
|-----|---------------|----------------|
| white | v > 0.88 AND s < 0.12 | Powdery coating |
| silver | 0.45 < v ≤ 0.88 AND s < 0.18 | Gray mold |
| green | 65 ≤ h ≤ 155 AND s > 0.2 AND v > 0.18 | Healthy (not diseased) |
| yellow | 42 ≤ h < 65 AND s > 0.28 AND v > 0.3 | Chlorosis/viral |
| brown | 15 ≤ h < 42 AND s > 0.22 AND v < 0.72 | Fungal lesions |
| orange | 5 ≤ h < 20 AND s > 0.42 AND v > 0.38 | Rust pustules |
| red | (h < 8 OR h ≥ 345) AND s > 0.38 AND v > 0.25 | Rot/canker |
| dark | v < 0.18 | Necrosis/blight |
| purple | 258 ≤ h < 322 AND s > 0.18 | Downy mildew |

**Step 3: Derived Feature Calculation**
```
Ratios:      R[bin] = bins[bin] / totalPixels         (0.0 – 1.0)
Variance:    σ² = Σ(v - μ)² / N                       (brightness)
TransRate:   transitions / totalPixels                 (spot density)
edgeRatio:   mean(8 perimeter zones disease density)
centerRatio: zoneDisease[1][1] / zoneTotal[1][1]

Boolean Flags:
  uniform     = σ² < 0.018        (uniform coating)
  spotty      = σ² > 0.042 AND transRate > 0.14
  mosaic      = 0.022 < σ² < 0.055
  edgeHeavy   = edgeRatio > centerRatio × 1.3
  centerHeavy = centerRatio > edgeRatio × 1.2
  diseaseSignal = 1 - R.green
```

### 11.2 Disease Group Scoring

Each of 7 disease groups receives a scalar score from the weighted feature vector:

| Group | Key Positive Signals | Key Negative Signals |
|-------|---------------------|---------------------|
| Powdery Mildew | white×15, silver×10, uniform?+8 | dark×-9, spotty?-8 |
| Leaf Scorch | brown×10, edgeHeavy?+9 | white×-9 |
| Early Blight | brown×9, centerHeavy?+7, spotty?+4 | white×-8 |
| Late Blight | dark×13, brown×4, !spotty?+5 | white×-10, yellow×-5 |
| Rust | orange×15, spotty?+7, transRate>0.18?+4 | white×-7, dark×-5 |
| Mosaic/Viral | yellow×13, mosaic?+8 | dark×-6, brown×-5 |
| Septoria | transRate>0.22?+9, spotty?+7 | white×-7, yellow×-4 |

**Winner Selection:**
```
ranked = sort(groups by score, descending)
winner = ranked[0].score > 0.8 ? ranked[0].group : null
```

### 11.3 Confidence Calculation

```
margin = ranked[0].score - ranked[1].score

If winner exists:
  baseConf = min(0.78 + (margin / 25) × 0.18 + rand(0.04), 0.98)

If no winner:
  baseConf = 0.68 + rand(0.12)

Top-5 probability distribution:
  primary: baseConf
  runners: weights [0.44, 0.27, 0.16, 0.13] × remaining (1 - baseConf)
           normalized to sum = 1 - baseConf
```

---

## 12. User Interface Requirements

### 12.1 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#52b788` | Buttons, highlights, badges |
| `--color-bg` | `#0a0f0d` | Page background |
| `--color-surface` | `#111a14` | Card backgrounds |
| `--color-border` | `rgba(82,183,136,0.12)` | Card borders |
| `--color-text` | `#e8f5ee` | Primary text |
| `--font-primary` | Inter (Google Fonts) | All body text |
| `--radius-lg` | `16px` | Large card corners |
| `--transition` | `0.25s ease` | All interactive transitions |

### 12.2 Page-Specific UI Requirements

#### Landing Page (`/`)
- Hero section with animated floating particles (20 particles)
- Animated stat counters triggering on IntersectionObserver
- Horizontal scrolling crop ticker (infinite marquee)
- Testimonial cards with star ratings
- All sections separated by visual hierarchy

#### Detect Page (`/detect`)
- Drop zone must show visual feedback on drag-over state
- Live analysis panel must appear within 500ms of image selection
- 3×3 heatmap cells must use red `rgba(230,57,70,α)` with intensity-mapped alpha
- Processing overlay must use animated rings (CSS keyframes)

#### Results Page (`/results`)
- SVG confidence ring must animate from 0 to target value on mount
- Prediction bars must animate width from 0 with staggered delays
- Healthy result must show a distinct green-themed panel
- Download button must trigger browser download without navigation

#### Dashboard Page (`/dashboard`)
- Charts must use `ResponsiveContainer` to fill available width
- Farm map markers must pulse with CSS animation
- Scan history table rows must highlight on hover
- Expert notes must appear inline beneath status badge

### 12.3 Responsive Breakpoints

| Breakpoint | Width | Layout Change |
|------------|-------|---------------|
| Mobile | < 640px | Single column, stacked nav |
| Tablet | 640–1024px | 2-column grid for some sections |
| Desktop | > 1024px | Full 2-column hero, 3-column features |
| Wide | > 1440px | Constrained max-width container |

---

## 13. External Interface Requirements

### 13.1 User Interface

- All pages shall use semantic HTML5 elements (`<main>`, `<nav>`, `<section>`, `<article>`)
- Interactive elements shall have unique IDs for testing (e.g., `id="hero-detect-btn"`)
- Each page shall have a unique, descriptive `<title>` tag

### 13.2 Browser Storage Interface

**localStorage Schema:**

```json
agriAI_users: [
  {
    "id": "timestamp_string",
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "farmer | expert"
  }
]

agriAI_user: {
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "farmer | expert"
}

agriAI_global_scans: [
  {
    "id": "string",
    "userId": "string",
    "farmerName": "string",
    "date": "ISO 8601 string",
    "crop": "string",
    "disease": "string",
    "confidence": "float 0.0–1.0",
    "severity": "Low | Moderate | Severe",
    "status": "Monitoring | Pending Review | Reviewed | Healthy",
    "expertNote": "string (optional)"
  }
]
```

**sessionStorage Schema:**

```json
agriAI_result: {
  "primaryClass": { "id": 0, "name": "string", "label": "string", "crop": "string", "isHealthy": false },
  "confidence": 0.94,
  "severity": "Moderate",
  "topPredictions": [{ "cls": {}, "conf": 0.94 }],
  "detectedGroup": "earlyBlight",
  "groupInfo": { "label": "string", "icon": "string", "color": "string" },
  "groupScores": [{ "group": "string", "score": 0.0 }],
  "reasoning": [{ "icon": "string", "text": "string" }],
  "colorSignature": { "green": 0.4, "brown": 0.2, ... },
  "info": { "severity": "string", "symptoms": [], "causes": "string", "treatments": [], "prevention": [], "economicImpact": "string" },
  "imageUrl": null,
  "timestamp": "ISO 8601 string"
}

agriAI_imageUrl: "blob:http://localhost:5173/uuid"
```

### 13.3 File Interface

**Input (Upload):**
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/bmp`, `image/gif`
- Maximum file size: 15 MB
- Processing resolution: Downsampled to 150×150 pixels internally

**Output (Download):**
- Format: Plain text (`.txt`)
- Encoding: UTF-8
- Filename pattern: `AgriAI_Report_<CropName>_<UnixTimestamp>.txt`

---

## 14. System Constraints & Limitations

### 14.1 Current Limitations

| Limitation | Impact | Future Resolution |
|------------|--------|------------------|
| No real CNN model | Classification uses heuristic scoring, not actual neural network weights | Integrate FastAPI + Keras model |
| localStorage only | No cross-device or cross-browser persistence | Backend database (PostgreSQL) |
| No real weather API | Weather widget uses hardcoded simulated data | OpenMeteo or WeatherStack API |
| Image-only input | No camera capture in real-time | MediaDevices.getUserMedia() |
| Client-side processing | Limited by browser memory and CPU | Server-side inference |
| No PDF export | Reports are plain text only | jsPDF or Puppeteer |
| English only | No localization | i18next integration |
| Mock products | Marketplace shows dummy products | Real e-commerce API |

### 14.2 Security Limitations (Demo)

> ⚠️ **Warning:** The current authentication stores passwords in plain text in localStorage. This is intentional for demo purposes only. A production system MUST use:
> - Server-side bcrypt/Argon2 password hashing
> - Secure HTTP-only session cookies or JWTs
> - HTTPS enforcement
> - CSRF protection

---

## 15. Appendix

### Appendix A: PlantVillage Dataset Summary

| Metric | Value |
|--------|-------|
| Total Images | 54,309 |
| Healthy Classes | 14 |
| Disease Classes | 24 |
| Total Classes | 38 |
| Image Resolution | Variable (256×256 to 4000×3000) |
| Crops Covered | 14 species |
| License | MIT (research use) |

### Appendix B: Disease Group → Class Mapping

| Group Key | Disease Classes Included |
|-----------|------------------------|
| `powderyMildew` | Cherry___Powdery_mildew, Squash___Powdery_mildew |
| `leafScorch` | Strawberry___Leaf_scorch, Apple___Apple_scab, Tomato___Target_Spot, Grape___Leaf_blight |
| `earlyBlight` | Tomato___Early_blight, Potato___Early_blight, Tomato___Bacterial_spot, Pepper___Bacterial_spot, Peach___Bacterial_spot |
| `lateBlight` | Tomato___Late_blight, Potato___Late_blight, Tomato___Leaf_Mold, Apple___Black_rot, Grape___Black_rot |
| `rust` | Corn___Common_rust, Apple___Cedar_apple_rust, Corn___Cercospora_leaf_spot, Corn___Northern_Leaf_Blight |
| `mosaic` | Tomato___mosaic_virus, Tomato___Yellow_Leaf_Curl_Virus, Orange___Haunglongbing, Grape___Esca, Tomato___Spider_mites |
| `septoria` | Tomato___Septoria_leaf_spot, Corn___Cercospora_leaf_spot |

### Appendix C: Scoring Formula Reference

```
s.powderyMildew = R.white×15 + R.silver×10 + uniform?8:-3 + spotty?-8:2
                + R.brown×-5 + R.dark×-9 + R.orange×-5 + R.green×-2

s.leafScorch    = R.brown×10 + R.red×4 + edgeHeavy?9:-3 + spotty?-5:2
                + edgeDiseaseRatio>0.28?5:0 + R.white×-9 + R.orange×-4 + R.yellow×-3

s.earlyBlight   = R.brown×9 + R.dark×5 + centerHeavy?7:-2 + spotty?4:0
                + R.green×1 + R.white×-8 + R.orange×-3 + R.yellow×-2

s.lateBlight    = R.dark×13 + R.brown×4 + R.purple×3 + !spotty?5:-3
                + diseaseSignal>0.4?3:0 + R.white×-10 + R.yellow×-5 + R.orange×-5

s.rust          = R.orange×15 + R.red×6 + R.brown×3 + spotty?7:-5
                + transitionRate>0.18?4:0 + R.white×-7 + R.dark×-5 + R.yellow×-3

s.mosaic        = R.yellow×13 + R.silver×3 + mosaic?8:-2 + !edgeHeavy?2:0
                + (0.02<variance<0.07)?4:0 + R.dark×-6 + R.brown×-5 + R.orange×-3

s.septoria      = R.brown×8 + R.dark×6 + transitionRate>0.22?9:-3
                + spotty?7:-4 + R.white×-7 + R.yellow×-4 + centerHeavy?2:0
```

### Appendix D: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | June 2026 | AgriAI Team | Initial release |

---

*End of Software Requirements Specification*

---

<div align="center">

**AgriAI SRS v1.0.0** | Confidential — For Project Use Only  
*"Specification today, harvest saved tomorrow."*

</div>
