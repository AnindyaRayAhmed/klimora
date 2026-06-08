<div align="center">

# 🌿 Klimora

### AI-Powered Civic Climate Intelligence Platform

**Hyperlocal climate scoring · Satellite analysis · AI-verified environmental missions · Community action**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000.svg)](https://fastify.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Google Cloud Run](https://img.shields.io/badge/Deployed_on-Cloud_Run-4285F4.svg)](https://cloud.google.com/run)

---

*"Every locality has a climate story. Klimora makes it visible, understandable, and actionable."*

</div>

---

## 📋 Table of Contents

1. [What is Klimora?](#-what-is-klimora)
2. [Why This Project Matters](#-why-this-project-matters)
3. [Live Demo](#-live-demo)
4. [Platform Preview](#-platform-preview)
5. [The Problem We Solve](#-the-problem-we-solve)
6. [How It Works — Platform Overview](#-how-it-works--platform-overview)
7. [Features](#-features)
8. [Technology Stack](#-technology-stack)
9. [Architecture Overview](#-architecture-overview)
10. [What Runs Where?](#-what-runs-where)
11. [Repository Structure](#-repository-structure)
12. [Database Schema](#-database-schema)
13. [API Reference](#-api-reference)
14. [🚀 Quick Start](#-quick-start)
15. [Setup Guide — Get Your Credentials](#-setup-guide--get-your-credentials)
    - [Prerequisites](#prerequisites)
    - [Step 1 — Fork & Clone the Repository](#step-1--fork--clone-the-repository)
    - [Step 2 — Set Up Supabase](#step-2--set-up-supabase)
    - [Step 3 — Run Database Migrations](#step-3--run-database-migrations)
    - [Step 4 — Set Up Google Cloud](#step-4--set-up-google-cloud)
    - [Step 5 — Get External API Keys](#step-5--get-external-api-keys)
16. [Environment Variables Reference](#-environment-variables-reference)
17. [Deployment Guide — GitHub to Cloud Run](#-deployment-guide--github-to-cloud-run)
18. [Local Development Setup (Optional)](#-local-development-setup-optional)
19. [Security Model](#-security-model)
20. [Background Jobs](#-background-jobs)
21. [Future Roadmap](#-future-roadmap)
22. [Contributing](#-contributing)
23. [License](#-license)

---

## 🌍 What is Klimora?

**Klimora** is an AI-powered civic climate intelligence platform that brings real-time, hyperlocal environmental data directly to citizens — displayed on an interactive map, explained by an AI assistant, and turned into actionable environmental missions.

Think of it as a **civic climate dashboard** that:

- Shows you the **climate health score** of your neighbourhood, right now
- Tells you **why** your area is getting hotter, drier, or more polluted — using satellite imagery and weather data
- Gives you personalized **environmental missions** to take action (planting trees, using public transport, reporting illegal burning)
- **Verifies** your mission evidence using Google Gemini AI — no manual review needed
- Rewards your actions with **points** and feeds your contribution back into the community's collective climate intelligence
- Lets you **chat with Rit**, Klimora's built-in AI climate analyst, who gives you context-aware, location-specific explanations for any climate question

Klimora is built for **residents, civic organizations, local governments, and sustainability advocates** who want to understand and improve the environmental health of the places they live in.

---

## 💚 Why This Project Matters

We are living through one of the most consequential periods in human history — a time when the decisions made at the neighbourhood level are beginning to compound into planetary outcomes. Yet the people who live closest to these changes are often the last to have access to meaningful, local, actionable information about them.

**The environmental data gap is not a technology problem. It is an access problem.**

Satellite imagery exists. Air quality sensors exist. Weather APIs exist. What has been missing is a bridge — something that takes the raw signal of a locality's climate reality and translates it into something a person can understand, care about, and act on.

Klimora is built on a few convictions:

- **Hyperlocal clarity matters.** A national AQI average tells a resident of Koramangala nothing useful. Knowing that *their ward* is seeing declining vegetation cover and rising heat anomalies this week — and understanding why — is something they can actually respond to.

- **Citizens are not passive observers.** People want to contribute. They just need missions that are proportionate to their lives: plant a tree, carpool to work, clean up a drain, report illegal waste burning. Small actions, properly recorded and verified, become meaningful community data.

- **AI should explain, not obscure.** Klimora's Rit assistant is designed to be a thoughtful translator — not a chatbot that produces plausible-sounding nonsense. It synthesizes real environmental data into answers that are honest about uncertainty and grounded in local context.

- **Environmental access is a civic right.** The communities most affected by climate change — urban heat islands, polluted industrial corridors, flood-prone low-lying wards — are often the least equipped to navigate technical data. Klimora aims to change this.

- **Collective intelligence compounds.** Every verified mission, every submitted photograph, every climate question asked of Rit feeds back into a richer picture of a locality's environmental story. The community's participation is not just civic engagement — it is a form of distributed environmental sensing.

Klimora is not a finished product. It is a working demonstration that it is possible to build infrastructure that **democratizes environmental intelligence** — and makes local climate action feel real, visible, and rewarding.

---

## 🌐 Live Demo

| Environment | URL |
|---|---|
| **Frontend** | Coming Soon |
| **Backend API** | Coming Soon |
| **Architecture Docs** | TBD |

> The platform is currently in active development. Deployment URLs will be updated here once a stable public instance is live. To run it yourself, see the [Quick Start](#-quick-start) section below.

---

## 📸 Platform Preview

> Screenshots and recordings will be added as the UI reaches a stable visual state.

![Dashboard Screenshot](docs/images/dashboard-placeholder.png)
![Rit AI Chat](docs/images/rit-chat-placeholder.png)
![Climate Map](docs/images/climate-map-placeholder.png)

---

## 🚨 The Problem We Solve

Modern cities face a growing climate crisis — rising urban heat, falling air quality, erratic rainfall, and shrinking green cover. Yet the data about these changes is:

- **Scattered** across government portals, research papers, and APIs
- **Technical** and inaccessible to the average citizen
- **Global or national** in scale — not hyperlocal
- **Passive** — no mechanism to turn awareness into citizen action

Klimora solves this by:

| Problem | Klimora's Solution |
|---|---|
| Climate data is scattered | Aggregates OpenWeather + Sentinel Hub satellite data into a unified score |
| Data is too technical | Rit AI translates raw metrics into plain-language explanations |
| No local context | Hyperlocal scoring per ward/locality using GPS coordinates |
| Citizens can't act | Gamified missions with AI verification turn awareness into action |
| Civic contributions are lost | Every mission submission becomes part of the community's climate intelligence record |

---

## ⚙️ How It Works — Platform Overview

Here is the big picture of how Klimora works from data to citizen action:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION                           │
│                                                                 │
│  OpenWeather API ──────────┐                                    │
│  (temperature, AQI,        │                                    │
│   rainfall, humidity)      ├──► Background Jobs ──► Supabase   │
│                            │    (Node.js, scheduled)            │
│  Sentinel Hub API ─────────┘                                    │
│  (NDVI vegetation index,                                        │
│   satellite imagery)                                            │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE LAYER                          │
│                                                                 │
│  Climate Score Engine                                           │
│  → Combines all signals into a 0–100 score per locality        │
│  → Labels: Healthy / Fair / Stressed / Critical                │
│                                                                 │
│  Rit AI Agent (Gemini-powered)                                 │
│  → Multi-agent orchestration                                    │
│  → Intent classification → Context assembly → Specialist agents │
│  → Synthesized, locality-aware response                        │
│                                                                 │
│  Verification Engine (Gemini Vision)                           │
│  → Analyses uploaded photo/video evidence                       │
│  → Rules-based compliance check                                 │
│  → Auto-verifies or flags for manual review                    │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       USER EXPERIENCE                           │
│                                                                 │
│  Interactive Map (Google Maps)                                  │
│  → Climate-coloured pins per locality                           │
│  → Layer switcher: heat / AQI / vegetation / rainfall          │
│                                                                 │
│  Climate Intelligence Panel                                     │
│  → Score card, forecast, timeline, breakdown                    │
│                                                                 │
│  Missions                                                       │
│  → Browse → Submit evidence → AI verifies → Earn points        │
│                                                                 │
│  Rit Chat                                                       │
│  → Ask any climate question in plain language                   │
│  → Proactive insights surfaced automatically                    │
│                                                                 │
│  Community Feed & Leaderboard                                   │
│  → See what your neighbours are doing                           │
│  → Rankings by locality                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🗺️ Hyperlocal Climate Intelligence Map
- Interactive Google Maps canvas with custom climate-coloured markers
- Switchable data layers: **Heat Index**, **Air Quality (AQI)**, **Vegetation (NDVI)**, **Rainfall**
- Click any locality pin to instantly load its full climate intelligence panel
- Real-time data hydration with live indicators

### 📊 Climate Health Scoring
- Each locality receives a **composite score from 0–100**
- Breakdown by: Heat Risk, Air Quality, Vegetation Cover, Rainfall Anomaly
- Confidence levels: High / Medium / Low
- Trend indicators: Improving / Stable / Declining

### 🤖 Rit — AI Climate Analyst
- Context-aware conversational AI powered by **Google Gemini**
- Multi-agent architecture routes each query to specialist sub-agents:
  - **Climate Intelligence Agent** — explains current conditions
  - **Forecast Intelligence Agent** — interprets upcoming weather
  - **Mission Intelligence Agent** — suggests relevant actions
  - **Recommendation Adapter** — personalizes to the user's profile
  - **Verification Explanation Agent** — explains mission outcomes
  - **Community Impact Agent** — surfaces collective actions
- Proactive insights pushed to the sidebar automatically
- Remembers conversation history per locality

### 🎯 Environmental Missions
- Curated library of real-world climate actions: Plant a Tree, Rooftop Garden, Rainwater Harvesting, Public Transport, Community Cleanup, Civic Reporting
- AI-powered recommendations tailored to your locality's current conditions
- Point rewards for each completed and verified mission
- Difficulty and impact ratings

### 📸 AI-Powered Evidence Verification
- Users upload photo or video evidence of completed missions
- Gemini Vision analyses media for mission compliance
- Rules engine cross-checks detections against mission requirements
- Automatic status: **Verified** (points awarded) → **Rejected** → **Manual Review**

### 👤 Profile & Points System
- User profile with total points, level progression, and submission history
- Points ledger — every point transaction is recorded with a reason
- Home locality assignment

### 🌐 Community Feed
- Browse verified submissions from other users in your locality
- See collective climate impact across all missions

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI component framework |
| **Vite** | 7 | Build tool and dev server |
| **TypeScript** | 5.8 | Type-safe development |
| **TanStack Router** | 1.x | Type-safe file-based routing |
| **TanStack Query** | 5.x | Server state, caching, data fetching |
| **Zustand** | 4.x | Lightweight global client state |
| **Radix UI** | 1.x | Accessible, unstyled UI primitives |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Recharts** | 2.x | Climate data charts and timelines |
| **Lucide React** | Latest | Icon library |
| **Zod** | 3.x | Schema validation |
| **Supabase JS** | 2.x | Auth and database client |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22+ | JavaScript runtime |
| **Fastify** | 5 | High-performance web server framework |
| **TypeScript** | 5.8 | Type-safe development |
| **@fastify/cors** | 10 | Cross-origin resource sharing |
| **@fastify/helmet** | 12 | HTTP security headers |
| **@fastify/rate-limit** | 10 | Rate limiting per user/IP |
| **@google/generative-ai** | 0.24 | Gemini AI SDK |
| **@supabase/supabase-js** | 2.x | Supabase admin client |
| **Zod** | 3.x | Runtime request validation |

### Infrastructure & Services

| Service | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, authentication, and file storage |
| **Google Gemini API** | AI intelligence — Rit agent and evidence verification |
| **Google Maps Platform** | Interactive map canvas, geocoding, places |
| **OpenWeather API** | Real-time weather data (temperature, AQI, rainfall) |
| **Sentinel Hub API** | Satellite imagery and NDVI vegetation indices |
| **Google Cloud Run** | Serverless container hosting for the backend |
| **GitHub** | Source control and CI/CD integration |

---

## 🏗️ Architecture Overview

Klimora uses a clean **monorepo structure** with a strict separation between the frontend (static SPA) and the backend (REST API server), both written in TypeScript.

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                    │
│          React 19 + Vite + TanStack Router           │
│          Hosted on Vercel / Firebase Hosting         │
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Map Canvas │  │  Rit Chat  │  │  Missions   │  │
│  │ Google Maps │  │   (AI UI)  │  │  & Submit   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         └────────────────┼─────────────────┘         │
│                          │ HTTPS API calls            │
└──────────────────────────┼──────────────────────────-┘
                           │
              ┌────────────▼────────────┐
              │   BACKEND (REST API)    │
              │   Fastify 5 + Node.js   │
              │   Google Cloud Run      │
              │   (deployed from GitHub)│
              │                         │
              │  /api/v1/climate        │
              │  /api/v1/localities     │
              │  /api/v1/missions       │
              │  /api/v1/verification   │
              │  /api/v1/rit            │
              │  /api/v1/forecasts      │
              │  /api/v1/community      │
              │  /api/v1/recommendations│
              └─────────────┬───────────┘
                            │
              ┌─────────────▼───────────┐
              │      SUPABASE           │
              │  PostgreSQL + Auth      │
              │  + Storage              │
              └──────────────────────────┘

External APIs (called by backend only — never from browser):
  ├─ Google Gemini API           (AI — Rit + verification)
  ├─ OpenWeather API             (weather data)
  └─ Sentinel Hub API            (satellite imagery + NDVI)
```

### Why This Architecture?

**Separation of concerns**: The frontend never touches secret API keys. Only the backend — which runs in a secure Cloud Run container with secrets injected at runtime — talks to Gemini, OpenWeather, and Sentinel Hub.

**Security by design**: Supabase Row Level Security (RLS) ensures users can only read/write their own data. The backend uses the privileged `service_role` key only for background jobs and AI verification, never exposing it to the browser.

**Scalability**: Cloud Run scales backend containers to zero when idle and spins up new instances under load — cost-efficient and production-grade.

**GitHub-native deployment**: The backend deploys directly from the GitHub repository to Cloud Run via Google Cloud Build — no local Docker builds required.

---

## 🗺️ What Runs Where?

This section is for anyone who wants to understand the deployment topology without getting into code. Each service has a specific role and lives in a specific place.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER'S BROWSER                                │
│                                                                     │
│  ✅ React frontend (HTML + CSS + JavaScript)                        │
│  ✅ Google Maps JavaScript (renders the interactive map)            │
│  ✅ Supabase Auth client (manages login session in browser)         │
│                                                                     │
│  ❌ NO backend secrets here — ever                                  │
│  ❌ NO Gemini calls — ever                                          │
│  ❌ NO OpenWeather calls — ever                                     │
│  ❌ NO Sentinel Hub calls — ever                                    │
└─────────────────────────────────────────────────────────────────────┘
         │ API calls over HTTPS
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD RUN (Backend)                        │
│                                                                     │
│  ✅ Fastify REST API server (Node.js)                               │
│  ✅ Rit AI orchestration (Gemini calls happen here)                 │
│  ✅ Evidence verification (Gemini Vision calls happen here)         │
│  ✅ Weather ingestion (OpenWeather calls happen here)               │
│  ✅ Satellite ingestion (Sentinel Hub calls happen here)            │
│  ✅ All secret keys stored in Google Secret Manager                 │
│                                                                     │
│  Deployed from: GitHub repository (auto-built by Cloud Build)      │
└─────────────────────────────────────────────────────────────────────┘
         │ reads/writes
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                    │
│                                                                     │
│  ✅ PostgreSQL database (all app data)                              │
│  ✅ Auth (user accounts, sessions, JWTs)                            │
│  ✅ Storage (mission-evidence bucket — photos and videos)           │
│  ✅ Row Level Security (data access policies)                       │
└─────────────────────────────────────────────────────────────────────┘
```

### At a Glance

| Service | Where it runs | Who accesses it | Contains secrets? |
|---|---|---|---|
| **React Frontend** | User's browser | Public users | ❌ No |
| **Google Maps JS** | User's browser | Public users | ⚠️ Public key (referrer-restricted) |
| **Fastify Backend** | Google Cloud Run | Frontend (via API) | ✅ Yes — all secrets live here |
| **Supabase DB** | Supabase cloud | Backend + Frontend (anon only) | ⚠️ Anon key in frontend is safe with RLS |
| **Gemini AI** | Google AI infra | Backend only | ✅ Key in Cloud Run secrets |
| **OpenWeather** | OpenWeather infra | Backend only | ✅ Key in Cloud Run secrets |
| **Sentinel Hub** | Sentinel infra | Backend only | ✅ Credentials in Cloud Run secrets |

> **For non-technical readers**: Think of it this way. The frontend is the shop window that users see — it runs inside your visitors' browsers. The backend is the back office where the sensitive work happens. Google Cloud Run is the building that houses the back office. All the keys to the filing cabinets (API secrets) live inside that building, not in the shop window.

---

## 📁 Repository Structure

```
klimora/
│
├── 📄 README.md                    ← You are here
├── 📄 LICENSE                      ← MIT License
├── 📄 .gitignore                   ← Git ignore rules (env files excluded)
├── 📄 production-readiness.md      ← Production deployment runbook
│
├── 📂 backend/                     ← Node.js + Fastify REST API
│   ├── 📄 package.json             ← Backend dependencies (Fastify, Gemini, Supabase)
│   ├── 📄 tsconfig.json            ← TypeScript compiler config
│   ├── 📄 .env.example             ← Template for all required environment variables
│   │
│   ├── 📂 supabase/
│   │   └── 📂 migrations/          ← SQL migration files (run in order)
│   │       ├── 001_mvp_schema.sql  ← Core tables: localities, missions, profiles, RLS policies
│   │       ├── 002_mvp_seed.sql    ← Seed data: 5 Bengaluru localities + 6 missions
│   │       ├── 003_climate_snapshots_forecasts.sql ← climate_snapshots + climate_forecasts tables
│   │       ├── 004_add_ndvi_fields.sql             ← NDVI vegetation fields
│   │       ├── 005_add_rainfall_baseline_metadata.sql ← Rainfall baseline fields
│   │       ├── 008_security_hardening.sql          ← Storage bucket RLS + hardened policies
│   │       ├── 20250531_004_storage_and_enhancements.sql ← Storage setup
│   │       ├── 20260601_006_rit_enhancements.sql   ← Rit conversation enhancements
│   │       └── 20260601_007_rit_insights_schema.sql ← rit_insights table
│   │
│   └── 📂 src/
│       ├── 📄 server.ts            ← HTTP server entry point (starts Fastify on PORT)
│       ├── 📄 app.ts               ← App bootstrap: registers plugins, middleware, routes
│       │
│       ├── 📂 api/
│       │   ├── 📂 middleware/      ← Auth guard, error handler middleware
│       │   └── 📂 routes/          ← One file per API domain
│       │       ├── auth.routes.ts
│       │       ├── climate.routes.ts
│       │       ├── communities.routes.ts
│       │       ├── forecasts.routes.ts
│       │       ├── layers.routes.ts
│       │       ├── localities.routes.ts
│       │       ├── missions.routes.ts
│       │       ├── recommendations.routes.ts
│       │       ├── rit.routes.ts
│       │       ├── users.routes.ts
│       │       ├── verification.routes.ts
│       │       └── admin.routes.ts
│       │
│       ├── 📂 modules/             ← Business logic, organized by domain
│       │   ├── 📂 agents/          ← AI agent implementations
│       │   │   ├── 📂 rit/         ← Rit multi-agent orchestrator + specialist agents
│       │   │   └── 📂 verification/ ← Gemini Vision verification agent
│       │   ├── 📂 climate/         ← Climate score computation
│       │   ├── 📂 community/       ← Community feed logic
│       │   ├── 📂 forecasts/       ← Forecast data access
│       │   ├── 📂 layers/          ← Map layer data serving
│       │   ├── 📂 localities/      ← Locality data service
│       │   ├── 📂 missions/        ← Mission CRUD and submission handling
│       │   ├── 📂 retrieval/       ← RAG retrieval indexing
│       │   ├── 📂 users/           ← User profile and points service
│       │   └── 📂 verification/    ← Verification orchestrator + rules engine
│       │
│       ├── 📂 jobs/                ← Scheduled background jobs
│       │   ├── ingest-openweather.job.ts    ← Fetches live weather per locality
│       │   ├── ingest-planet.job.ts         ← Fetches Sentinel Hub NDVI satellite data
│       │   ├── compute-climate-scores.job.ts ← Recomputes composite climate scores
│       │   ├── refresh-forecasts.job.ts     ← Updates forecast table
│       │   ├── refresh-rankings.job.ts      ← Updates community rankings
│       │   ├── verification-processing.job.ts ← Processes pending evidence
│       │   ├── index-retrieval-documents.job.ts ← Updates RAG document index
│       │   └── cleanup-expired-cache.job.ts ← Cleans stale cache entries
│       │
│       ├── 📂 providers/           ← External API client wrappers
│       │   ├── 📂 gemini/          ← Google Gemini AI client
│       │   ├── 📂 google-maps/     ← Google Maps client
│       │   ├── 📂 openweather/     ← OpenWeather API client
│       │   ├── 📂 planet/          ← Sentinel Hub satellite data client (OAuth2)
│       │   └── 📂 supabase/        ← Supabase admin + anon client factory
│       │
│       ├── 📂 security/            ← Security utilities
│       │   ├── audit-log.service.ts ← Audit trail logging
│       │   ├── permissions.ts       ← Permission helpers
│       │   ├── row-access.ts        ← RLS row access helpers
│       │   └── signed-urls.ts       ← Supabase signed URL generation
│       │
│       ├── 📂 cache/               ← In-memory caching layer
│       ├── 📂 config/              ← App configuration and constants
│       ├── 📂 events/              ← Internal event emitters
│       ├── 📂 shared/              ← Shared utilities, errors, types
│       ├── 📂 tests/               ← Integration and unit tests
│       └── 📂 types/               ← Shared TypeScript type definitions
│
└── 📂 frontend/                    ← React 19 + Vite SPA
    ├── 📄 package.json             ← Frontend dependencies
    ├── 📄 vite.config.ts           ← Vite build configuration
    ├── 📄 tsconfig.json            ← TypeScript config
    ├── 📄 index.html               ← HTML entry point
    ├── 📄 components.json          ← Shadcn/UI component registry
    │
    └── 📂 src/
        ├── 📄 main.tsx             ← React app entry point
        ├── 📄 router.tsx           ← TanStack Router setup
        ├── 📄 routeTree.gen.ts     ← Auto-generated route tree
        ├── 📄 styles.css           ← Global CSS, design tokens, glassmorphism
        │
        ├── 📂 routes/              ← File-based pages
        │   ├── __root.tsx          ← Root layout (nav, auth guard)
        │   ├── index.tsx           ← Climate Dashboard (map + intelligence panel)
        │   ├── missions.tsx        ← Missions browser and recommendations
        │   ├── submit.tsx          ← Mission evidence submission form
        │   ├── rit.tsx             ← Rit AI chat interface
        │   ├── community.tsx       ← Community feed and leaderboard
        │   └── profile.tsx         ← User profile and points history
        │
        ├── 📂 components/          ← Reusable UI components
        │   ├── AppNav.tsx          ← Application navigation bar
        │   ├── MapCanvas.tsx       ← Google Maps interactive canvas
        │   ├── ClimateHealthCard.tsx ← Locality score card
        │   ├── ScoreBreakdown.tsx  ← Score breakdown by indicator
        │   ├── ForecastCard.tsx    ← Weather forecast display
        │   ├── ClimateTimeline.tsx ← Historical score chart
        │   ├── LocalityInsights.tsx ← Locality-level insight chips
        │   ├── EnvironmentalPanel.tsx ← Full environment data panel
        │   ├── LayerSwitcher.tsx   ← Map layer toggle controls
        │   ├── VerificationBadge.tsx ← Mission verification status badge
        │   ├── VerificationDetails.tsx ← Detailed verification result
        │   ├── ConfidenceBadge.tsx ← Confidence level display
        │   ├── EvidenceSources.tsx ← Data source attribution
        │   ├── Logo.tsx            ← Klimora logo component
        │   └── 📂 ui/             ← Radix UI + shadcn primitives
        │
        ├── 📂 hooks/               ← Custom React hooks
        │   ├── use-auth.ts         ← Auth state and session management
        │   ├── use-climate.ts      ← Climate data fetching + dashboard state
        │   ├── use-missions.ts     ← Mission list + recommendation state
        │   └── use-rit.ts          ← Rit chat state and message handling
        │
        ├── 📂 lib/                 ← Utility functions and API clients
        ├── 📂 store/               ← Zustand global state (selected locality, active layer)
        └── 📂 styles/              ← Additional stylesheets
```

> **Note on `providers/planet/`**: The folder is named `planet/` in the codebase (reflecting an earlier integration path), but it implements the **Sentinel Hub API** — ESA's Copernicus satellite data platform. The `ingest-planet.job.ts` background job uses `SENTINEL_HUB_CLIENT_ID` and `SENTINEL_HUB_CLIENT_SECRET` to authenticate with Sentinel Hub via OAuth2 and fetch NDVI vegetation index data. The folder and job names are preserved as-is to maintain codebase accuracy; the provider integrates Sentinel Hub satellite data.

---

## 🗄️ Database Schema

Klimora uses **PostgreSQL** via Supabase. All tables have **Row Level Security (RLS)** enabled, meaning users can only access data they are authorized to see. Below is a plain-English explanation of every table.

### Table Map

```
auth.users (managed by Supabase Auth)
    │
    └─► profiles            ← One profile per user
            │
            ├─► mission_submissions   ← Evidence uploaded by users
            │       │
            │       └─► verification_results ← AI verification outcome
            │
            ├─► user_points           ← Point transaction ledger
            ├─► rit_conversations     ← Rit AI chat sessions
            │       └─► rit_messages  ← Individual chat messages
            └─► rit_insights          ← Proactive AI-generated insights

localities                  ← Geographic areas (wards, neighbourhoods)
    │
    ├─► climate_scores       ← Composite climate scores per locality
    ├─► climate_snapshots    ← Historical raw sensor readings
    ├─► climate_forecasts    ← Upcoming weather forecasts
    └─► missions             ← Available environmental actions
```

---

### Table Descriptions

<details>
<summary><strong>📍 localities</strong> — Geographic areas tracked by Klimora</summary>

Each row represents a **ward, neighbourhood, or locality** for which Klimora tracks climate data. Think of these as the smallest geographic unit in the system.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Unique identifier |
| `slug` | text | URL-friendly name (e.g. `indiranagar`) |
| `name` | text | Display name (e.g. `Indiranagar`) |
| `city` | text | City (e.g. `Bengaluru`) |
| `state` | text | State (e.g. `Karnataka`) |
| `country` | text | Country (default: `India`) |
| `latitude` | numeric | Geographic coordinate |
| `longitude` | numeric | Geographic coordinate |
| `description` | text | Human-readable summary of the locality's climate context |

**RLS**: Public read. Only backend service role can insert/update.

**Seed data includes**: Indiranagar, Koramangala, Jayanagar, HSR Layout, Whitefield — all in Bengaluru.

</details>

<details>
<summary><strong>📊 climate_scores</strong> — The composite health score for each locality</summary>

This is the **heart of Klimora's intelligence layer**. Each row is a computed score snapshot for a locality at a point in time.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Unique identifier |
| `locality_id` | UUID | Reference to the locality |
| `score` | integer (0–100) | Composite environmental health score |
| `label` | text | `Healthy` / `Fair` / `Stressed` / `Critical` |
| `trend` | text | `improving` / `stable` / `declining` |
| `temperature_c` | numeric | Observed temperature in Celsius |
| `heat_index_c` | numeric | Feels-like temperature (heat + humidity) |
| `aqi` | integer | Air Quality Index |
| `ndvi` | numeric | Vegetation index from satellite (0–1) |
| `rainfall_mm` | numeric | Observed rainfall in millimetres |
| `rainfall_anomaly_pct` | numeric | % deviation from the historical baseline |
| `confidence` | text | `High` / `Medium` / `Low` — data quality |
| `breakdown` | JSONB | Array of penalty items explaining the score |
| `computed_at` | timestamp | When this score was calculated |

**RLS**: Public read. Only service role can insert.

</details>

<details>
<summary><strong>📸 climate_snapshots</strong> — Raw historical sensor readings</summary>

Raw, time-stamped environmental readings ingested from OpenWeather and Sentinel Hub. Unlike `climate_scores` (which are computed), snapshots store the **raw input signals** for a locality at a given moment in time.

| Column | Type | Description |
|---|---|---|
| `locality_id` | UUID | Which locality |
| `temperature_c` | numeric | Temperature reading |
| `heat_index_c` | numeric | Heat index reading |
| `aqi` | numeric | Air quality reading |
| `ndvi` | numeric | Vegetation index from satellite |
| `rainfall_mm` | numeric | Rainfall reading |
| `rainfall_anomaly_pct` | numeric | Deviation from baseline |
| `observed_at` | timestamp | When the reading was taken |

**Used by**: The climate score computation job, the Rit agent's context assembler, and the timeline chart in the UI.

</details>

<details>
<summary><strong>🌤️ climate_forecasts</strong> — Upcoming weather forecasts per locality</summary>

Stores forecasted values (temperature, AQI, rainfall) for each locality, one row per `(locality, date)` combination.

| Column | Type | Description |
|---|---|---|
| `locality_id` | UUID | Which locality |
| `forecast_date` | date | The date being forecasted |
| `temperature_c` | numeric | Forecasted temperature |
| `heat_index_c` | numeric | Forecasted heat index |
| `aqi` | numeric | Forecasted AQI |
| `rainfall_mm` | numeric | Forecasted rainfall |

**Used by**: The Forecast Card in the dashboard and the `refresh-forecasts` background job.

</details>

<details>
<summary><strong>🎯 missions</strong> — Available environmental action challenges</summary>

A curated library of real-world environmental actions. Missions are seeded by the Klimora team and do not change often.

| Column | Type | Description |
|---|---|---|
| `slug` | text | Unique identifier (e.g. `plant-tree`) |
| `title` | text | Display title (e.g. `Plant Tree`) |
| `category` | text | `green` / `mobility` / `community` / `civic` |
| `description` | text | What the user needs to do |
| `points` | integer | Reward points upon verification |
| `active` | boolean | Whether this mission is currently live |
| `verification_prompt_hint` | text | Hint for the AI verification agent |

**Seeded missions**:
- 🌳 Plant Tree (100 pts)
- 🏠 Rooftop Garden (250 pts)
- 💧 Rainwater Harvesting (220 pts)
- 🚌 Public Transport (10 pts)
- 🧹 Community Cleanup (100 pts)
- 📢 Civic Reporting (80 pts)

</details>

<details>
<summary><strong>📤 mission_submissions</strong> — Evidence uploaded by users for completed missions</summary>

When a user completes a mission and uploads photo/video evidence, a row is created here.

| Column | Type | Description |
|---|---|---|
| `user_id` | UUID | Which user submitted |
| `mission_id` | UUID | Which mission was completed |
| `locality_id` | UUID | Where the mission took place |
| `status` | text | `submitted` → `verifying` → `verified` / `rejected` / `manual_review` |
| `media_bucket` | text | Supabase Storage bucket name (`mission-evidence`) |
| `media_path` | text | File path within the bucket |
| `media_type` | text | `image` or `video` |
| `user_note` | text | Optional user-written description |
| `submitted_at` | timestamp | When uploaded |
| `verified_at` | timestamp | When verification completed |

**RLS**: Users can read and create their own submissions. Nobody else can see them. Only service role can update status.

</details>

<details>
<summary><strong>✅ verification_results</strong> — AI verification outcomes</summary>

After the Gemini Vision agent analyses a submission, the result is stored here.

| Column | Type | Description |
|---|---|---|
| `submission_id` | UUID | Which submission this result belongs to |
| `status` | text | `verified` / `rejected` / `manual_review` / `failed` |
| `confidence_score` | numeric (0–1) | AI confidence in its decision |
| `detected_objects` | JSONB | List of objects the AI detected in the media |
| `mission_compliance` | JSONB | Compliance observations from the AI |
| `reason` | text | Plain-language explanation of the decision |
| `model_name` | text | Which Gemini model was used |

**RLS**: Users can read results for their own submissions. No user can insert or modify verification results.

</details>

<details>
<summary><strong>💰 user_points</strong> — Points transaction ledger</summary>

Every points award is recorded here as an immutable transaction. This is the source of truth for a user's point balance.

| Column | Type | Description |
|---|---|---|
| `user_id` | UUID | Which user |
| `submission_id` | UUID | Which mission submission earned these points (nullable for bonus points) |
| `points` | integer | Points awarded |
| `reason` | text | Why these points were given |

**Key rule**: There is a unique constraint ensuring only one positive reward per submission, preventing double-rewarding. **Only the service role can insert points** — users can only read their own ledger.

</details>

<details>
<summary><strong>💬 rit_conversations</strong> — Rit AI chat sessions</summary>

Each conversation between a user and Rit is stored as a session, linked to a locality for context.

| Column | Type | Description |
|---|---|---|
| `user_id` | UUID | Which user |
| `locality_id` | UUID | Which locality the conversation is about |
| `title` | text | Auto-generated or user-named conversation title |

**RLS**: Users can only read and create their own conversations.

</details>

<details>
<summary><strong>📝 rit_messages</strong> — Individual messages in Rit conversations</summary>

Each message exchange (user → Rit → user → ...) is stored here.

| Column | Type | Description |
|---|---|---|
| `conversation_id` | UUID | Parent conversation |
| `role` | text | `user` or `assistant` |
| `content` | text | The message text |
| `citations` | JSONB | Data sources cited by Rit (if any) |

**RLS**: Users can only read and create messages in their own conversations.

</details>

<details>
<summary><strong>💡 rit_insights</strong> — Proactive AI-generated insights</summary>

Rit proactively generates insights about a locality based on current conditions. These are surfaced in the Rit chat sidebar without the user needing to ask.

| Column | Type | Description |
|---|---|---|
| `locality_id` | UUID | Which locality this insight is about |
| `user_id` | UUID | If null, it's a public locality insight. If set, it's personalized |
| `insight_type` | text | Category of insight (e.g. `heat_advisory`, `vegetation_alert`) |
| `severity` | text | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| `title` | text | Short headline |
| `body` | text | Full insight text |
| `expires_at` | timestamp | When this insight becomes stale |
| `metadata` | JSONB | Additional structured data |

**RLS**: Users can read public locality insights (where `user_id IS NULL`) and their own personalized ones.

</details>

<details>
<summary><strong>👤 profiles</strong> — User profiles linked to Supabase Auth</summary>

Automatically created when a user signs up via a database trigger (`handle_new_user`).

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Same as `auth.users.id` |
| `username` | text | Optional unique username |
| `full_name` | text | Display name (pulled from OAuth provider) |
| `avatar_url` | text | Profile picture URL |
| `home_locality_id` | UUID | User's default locality |
| `total_points` | integer | Cached total points (≥ 0) |
| `level` | integer | Progression level (≥ 1) |

**RLS**: Users can read and update their own profile. Nobody else can read another user's profile from the frontend.

</details>

---

## 🌐 API Reference

The backend exposes a versioned REST API at `/api/v1`. All endpoints return JSON.

### Base URL
- **Local**: `http://localhost:8080/api/v1`
- **Production**: Your Cloud Run service URL + `/api/v1`

### Health Check
```
GET /health
→ { "status": "ok", "timestamp": "..." }
```

### Route Groups

| Route Group | Prefix | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Session management |
| Users | `/api/v1/users` | Profile read/update |
| Localities | `/api/v1/localities` | List and fetch localities |
| Climate | `/api/v1/climate` | Scores, snapshots, layers |
| Forecasts | `/api/v1/forecasts` | Weather forecasts |
| Layers | `/api/v1/layers` | Map layer data |
| Missions | `/api/v1/missions` | Mission list and submission |
| Verification | `/api/v1/verification` | Submit and check verification |
| Rit | `/api/v1/rit` | AI chat, insights |
| Recommendations | `/api/v1/recommendations` | Personalized mission recommendations |
| Community | `/api/v1/community` | Community feed |
| Admin | `/api/v1/admin` | Admin-only operations |

---

## 🚀 Quick Start

> This section gives you the fastest path from zero to a running Klimora instance. For detailed explanations of every step, see the [Setup Guide](#-setup-guide--get-your-credentials) below.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/klimora.git
cd klimora
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend (in a new terminal)
cd frontend && npm install
```

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com/)
2. Run the SQL migrations from `backend/supabase/migrations/` in numbered order via the Supabase SQL Editor
3. Create a private storage bucket named `mission-evidence`
4. Note your **Project URL**, **anon key**, and **service_role key**

### 4. Get your API keys

| Key | Where to get it |
|---|---|
| **Gemini API Key** | [aistudio.google.com](https://aistudio.google.com/) |
| **Google Maps API Key** | [console.cloud.google.com](https://console.cloud.google.com/) → APIs & Services → Credentials |
| **OpenWeather API Key** | [openweathermap.org/api](https://openweathermap.org/api) |
| **Sentinel Hub Client ID + Secret** | [sentinel-hub.com](https://www.sentinel-hub.com/) → User Settings → OAuth Clients |

### 5. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in all values in backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
# Fill in all VITE_* values in frontend/.env.local
```

See the [Environment Variables Reference](#-environment-variables-reference) for the full variable list.

### 6. Run locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# → Server listening on http://localhost:8080

# Terminal 2 — Frontend
cd frontend && npm run dev
# → http://localhost:5173
```

### 7. Deploy to production

- **Backend**: Connect your GitHub fork to [Google Cloud Run](https://console.cloud.google.com/run) with continuous deployment
- **Frontend**: Import your repo to [Vercel](https://vercel.com/) with root directory set to `frontend`

For full deployment walkthroughs, see the [Deployment Guide](#-deployment-guide--github-to-cloud-run).

---

## 🚀 Setup Guide — Get Your Credentials

This section walks you through creating all the accounts, projects, and API keys that Klimora needs to run — whether you are deploying to production or running locally for development.

> **The recommended production workflow is**: set up credentials here → push your fork to GitHub → deploy the backend directly from GitHub to Cloud Run (no local Docker needed). See the [Deployment Guide](#-deployment-guide--github-to-cloud-run) after completing these steps.

### Prerequisites

Before you start, make sure you have:

| Tool | What it is | Download |
|---|---|---|
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |
| A **GitHub account** | For hosting the code and triggering deployments | [github.com](https://github.com/) |
| A **Supabase account** | Free database + auth + storage | [supabase.com](https://supabase.com/) |
| A **Google Cloud account** | For Maps API + Cloud Run deployment | [cloud.google.com](https://cloud.google.com/) |
| A **Google AI Studio account** | For Gemini API key | [aistudio.google.com](https://aistudio.google.com/) |
| An **OpenWeather account** | For real-time weather data | [openweathermap.org/api](https://openweathermap.org/api) |
| A **Sentinel Hub account** | For satellite/NDVI data | [sentinel-hub.com](https://www.sentinel-hub.com/) |
| **Node.js 22+** *(local dev only)* | JavaScript runtime | [nodejs.org](https://nodejs.org/) |

---

### Step 1 — Fork & Clone the Repository

**Fork first** (important for Cloud Run GitHub integration):

1. Go to [github.com/AnindyaRayAhmed/klimora](https://github.com/AnindyaRayAhmed/klimora)
2. Click **"Fork"** in the top-right corner
3. Choose your GitHub account as the destination

Then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/klimora.git
cd klimora
```

---

### Step 2 — Set Up Supabase

Supabase is the foundation of Klimora. It provides:
- **PostgreSQL database** — where all your data lives
- **Authentication** — handles user sign-up, login, and sessions automatically
- **Storage** — where uploaded mission evidence (photos/videos) is stored

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in (free account is enough)
2. Click **"New Project"**
3. Enter a project name: `klimora`
4. Choose a **Database Password** — save this somewhere safe
5. Choose the region closest to your users
6. Click **"Create new project"** and wait ~2 minutes for provisioning

#### 2.2 Retrieve Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** → **API** in the Supabase sidebar
2. You will see three important values:

| Credential | Where to find it | Security Level |
|---|---|---|
| **Project URL** | API → Project URL | Public — safe to use in frontend |
| **anon / public key** | API → Project API Keys → `anon public` | Public — safe to use in frontend |
| **service_role key** | API → Project API Keys → `service_role secret` | 🔴 SECRET — never expose in frontend |

> **What are these keys?**
> - The **anon key** is a low-privilege key. Combined with Row Level Security (RLS), it is safe to include in the browser. It can only do what RLS policies allow.
> - The **service_role key** bypasses all RLS — it has full admin access to your database. It must only ever live in your backend server, never in browser code.

#### 2.3 Understanding Authentication

Supabase handles all of user sign-up, login, and session management. When a user signs up:

1. Supabase creates a record in its internal `auth.users` table
2. A PostgreSQL trigger (`handle_new_user`) automatically creates a matching row in `public.profiles`
3. The user receives a JWT token stored in their browser
4. Every request from the frontend includes this token, which Supabase verifies against RLS policies

Klimora uses **email/password** authentication by default. You can enable Google, GitHub, or other OAuth providers in the Supabase dashboard under **Authentication → Providers**.

#### 2.4 Understanding Row Level Security (RLS)

Row Level Security is a PostgreSQL feature that Klimora uses extensively.

**Think of it this way**: Without RLS, if you gave the anon key to the browser, any user could run `SELECT * FROM profiles` and see every user's profile. With RLS, each query is automatically filtered so users can only see rows that pass the policy check.

For example:
```sql
-- Only the profile owner can read their own row
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

`auth.uid()` returns the ID of the currently signed-in user. So this policy ensures `SELECT` on `profiles` only ever returns the row where `id = current_user_id`.

---

### Step 3 — Run Database Migrations

Migrations are SQL files that create all the tables, indexes, and policies Klimora needs. You need to run them in the correct order.

#### Option A — Using the Supabase Dashboard (Recommended for beginners)

1. In your Supabase project, go to **SQL Editor** in the sidebar
2. Click **"New query"**
3. Open each migration file from `backend/supabase/migrations/` in order:
   - `001_mvp_schema.sql`
   - `002_mvp_seed.sql`
   - `003_climate_snapshots_forecasts.sql`
   - `004_add_ndvi_fields.sql`
   - `005_add_rainfall_baseline_metadata.sql`
   - `20250531_004_storage_and_enhancements.sql`
   - `20260601_006_rit_enhancements.sql`
   - `20260601_007_rit_insights_schema.sql`
   - `008_security_hardening.sql`
4. Copy each file's contents, paste into the SQL editor, and click **"Run"**
5. Repeat for each file in the order listed above

> **Why order matters**: Later migrations reference tables created by earlier ones. Running them out of order will cause errors.

#### Option B — Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Log in
supabase login

# Link to your project (get project ref from Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

#### 3.1 Create the Mission-Evidence Storage Bucket

After running migrations, you need to create the storage bucket manually:

1. Go to **Storage** in the Supabase sidebar
2. Click **"New bucket"**
3. Name it exactly: `mission-evidence`
4. Set **Public**: OFF (private bucket — access is controlled by RLS)
5. Click **"Create bucket"**

> The security hardening migration (`008_security_hardening.sql`) adds RLS policies to this bucket ensuring users can only upload files to their own folder (`{user_id}/filename`) and can only read/delete their own files. The service role has full access for the AI verification job.

---

### Step 4 — Set Up Google Cloud

Google Cloud provides Klimora's mapping capabilities and is also where the backend is deployed.

#### 4.1 Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click the project selector (top of page) → **"New Project"**
3. Name it `klimora` and click **"Create"**
4. Make sure you are in the new project (check the top bar)

#### 4.2 Enable Required APIs

You need to enable these APIs for Klimora to function. For each one:
1. Go to **APIs & Services → Library**
2. Search for the API name
3. Click **"Enable"**

| API | Why Klimora needs it |
|---|---|
| **Maps JavaScript API** | Powers the interactive map canvas on the dashboard |
| **Places API** | Enables location search and autocomplete |
| **Geocoding API** | Converts text addresses to GPS coordinates and vice versa |
| **Geolocation API** | Allows detecting the user's current location |

#### 4.3 Generate Google Maps API Key

1. Go to **APIs & Services → Credentials**
2. Click **"Create Credentials"** → **"API Key"**
3. Your key will be created. Click **"Edit API Key"** (the pencil icon)
4. Under **Application restrictions**:
   - For development: select **"None"**
   - For production: select **"HTTP referrers (web sites)"** and add your domain (e.g. `https://klimora.app/*`)
5. Under **API restrictions**: Restrict to the four APIs you enabled above
6. Click **"Save"**

> **Why API restrictions matter**: Without restrictions, anyone who finds your key can use it and rack up charges on your Google Cloud billing account. HTTP referrer restrictions ensure the key only works when requests come from your website's domain.

> **📍 Important — The Maps key is intentionally public**: The Google Maps JavaScript API requires its key to be present in the browser to render the map. This is by design — every Google Maps-powered website does this. The key is visible in your browser's source code and that is completely normal and expected. Security is achieved through **HTTP referrer restrictions** in the Google Cloud Console (not by hiding the key). Set your referrer to `https://your-domain.com/*` and the key becomes useless to anyone who tries to use it from a different domain. Do not panic if you see `VITE_GOOGLE_MAPS_API_KEY` in your frontend — that is correct and intentional.

---

### Step 5 — Get External API Keys

#### 5.1 Gemini API Key (AI Intelligence)

Gemini powers both Rit (the AI chat) and the evidence verification engine.

1. Go to [aistudio.google.com](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy and save the key

> **What Gemini does in Klimora**:
> - **Rit Agent**: Synthesizes climate context into conversational answers using the `gemini-2.0-flash` model
> - **Evidence Verification**: Analyses user-uploaded photos/videos against mission requirements using Gemini Vision

#### 5.2 OpenWeather API Key (Weather Data)

OpenWeather provides real-time temperature, AQI, rainfall, and humidity data.

1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to your profile → **"My API Keys"**
4. Copy the default API key (or create a new one)

> The free plan (60 calls/min) is sufficient for development. For production with many localities, the paid **One Call API 3.0** plan is recommended.

#### 5.3 Sentinel Hub Credentials (Satellite / NDVI Data)

Sentinel Hub provides access to ESA Copernicus satellite imagery used to calculate the **NDVI vegetation index** (vegetation health) for each locality.

1. Go to [sentinel-hub.com](https://www.sentinel-hub.com/)
2. Sign up and create a free account
3. Go to your dashboard → **"User Settings"** → **"OAuth Clients"**
4. Click **"+ Add"** to create a new OAuth client
5. Give it a name (e.g. `klimora-backend`)
6. Save both values that are generated:
   - **Client ID** → this is your `SENTINEL_HUB_CLIENT_ID`
   - **Client Secret** → this is your `SENTINEL_HUB_CLIENT_SECRET`

> **What is NDVI?** NDVI (Normalized Difference Vegetation Index) measures green vegetation cover using near-infrared satellite data. A value close to 1 means dense, healthy green cover (forests, parks). A value close to 0 means urban surfaces, concrete, or bare land. Klimora uses NDVI to score vegetation health for each locality and factor it into the composite climate score.

> **Important**: Sentinel Hub uses OAuth2 Client Credentials. The backend exchanges the `SENTINEL_HUB_CLIENT_ID` and `SENTINEL_HUB_CLIENT_SECRET` for a short-lived access token on each request. Both values must be kept secret and stored in Cloud Run Secret Manager in production.

---

## 🔑 Environment Variables Reference

Environment variables are how secrets and configuration are passed to the application without hard-coding them. Klimora has **three distinct places** where variables are configured, and understanding which variable belongs where is critical.

> **Core rule**: Variables starting with `VITE_` are baked into the frontend at build time and are visible in the browser. All other variables are backend-only and must never appear in frontend code.

---

### A) Local Development Variables

> **This section is for developers running Klimora on their own machine.** If you are only deploying to production, skip to sections B and C.

#### Backend — `backend/.env`

Create this file by copying the example:

```bash
cd backend
cp .env.example .env
```

Then fill in all values:

```env
# ───────────────────────────────────────────
# RUNTIME
# ───────────────────────────────────────────
NODE_ENV=development
PORT=8080
API_BASE_PATH=/api/v1

# URL of your local frontend Vite dev server (for CORS)
FRONTEND_URL=http://localhost:5173

# ───────────────────────────────────────────
# SUPABASE
# ───────────────────────────────────────────
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhb...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...your-service-role-key...

# ───────────────────────────────────────────
# GOOGLE CLOUD & AI
# ───────────────────────────────────────────
GOOGLE_CLOUD_PROJECT=klimora
GOOGLE_CLOUD_REGION=us-central1
GEMINI_API_KEY=AIza...your-gemini-key...

# ───────────────────────────────────────────
# EXTERNAL APIs
# ───────────────────────────────────────────
OPENWEATHER_API_KEY=your-openweather-key
SENTINEL_HUB_CLIENT_ID=your-sentinel-hub-client-id
SENTINEL_HUB_CLIENT_SECRET=your-sentinel-hub-client-secret

# ───────────────────────────────────────────
# SECURITY
# ───────────────────────────────────────────
JWT_AUDIENCE=klimora-api
RATE_LIMIT_MAX=120
RATE_LIMIT_WINDOW=1 minute
```

#### Frontend — `frontend/.env.local`

Create this file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env.local
```

Then fill in all values:

```env
# ───────────────────────────────────────────
# SUPABASE (public — safe for browser with RLS enabled)
# ───────────────────────────────────────────
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...your-anon-key...

# ───────────────────────────────────────────
# GOOGLE MAPS (intentionally public — protected by HTTP referrer restriction)
# ───────────────────────────────────────────
VITE_GOOGLE_MAPS_API_KEY=AIza...your-maps-key...

# ───────────────────────────────────────────
# BACKEND API (local dev server)
# ───────────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> **Why `.env` files are gitignored**: The `.gitignore` at the root excludes all `.env`, `.env.local`, and `.env.production` files from Git. This is the primary safeguard against accidentally committing credentials to GitHub.

---

### B) Cloud Run Backend — Secret Manager & Environment Variables

In production, the backend running on Google Cloud Run receives its configuration in two ways:

**Plain environment variables** (non-sensitive configuration — set directly in Cloud Run):

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `8080` | Cloud Run's default port |
| `API_BASE_PATH` | `/api/v1` | API route prefix |
| `FRONTEND_URL` | `https://your-frontend-domain.com` | Used for CORS — must be exact |
| `GOOGLE_CLOUD_PROJECT` | `your-gcp-project-id` | GCP project name |
| `GOOGLE_CLOUD_REGION` | `us-central1` | Cloud Run region |
| `JWT_AUDIENCE` | `klimora-api` | JWT validation audience |
| `RATE_LIMIT_MAX` | `120` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `1 minute` | Rate limit window |

**Secrets from Google Secret Manager** (sensitive — never set as plain env vars):

| Secret Name in Secret Manager | Maps to Variable | Why it's secret |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Full database admin access — bypasses RLS |
| `SUPABASE_URL` | `SUPABASE_URL` | Project URL (treat as sensitive in backend) |
| `SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` | Used in some backend contexts |
| `GEMINI_API_KEY` | `GEMINI_API_KEY` | Paid AI service — backend only |
| `OPENWEATHER_API_KEY` | `OPENWEATHER_API_KEY` | Paid weather service — backend only |
| `SENTINEL_HUB_CLIENT_ID` | `SENTINEL_HUB_CLIENT_ID` | Satellite data OAuth client |
| `SENTINEL_HUB_CLIENT_SECRET` | `SENTINEL_HUB_CLIENT_SECRET` | 🔴 Most sensitive Sentinel credential |
| `GOOGLE_MAPS_API_KEY` | `GOOGLE_MAPS_API_KEY` | Server-side maps usage (optional) |

> **What is Google Secret Manager?** It is Google Cloud's dedicated vault for storing secrets. Instead of pasting your API keys into the Cloud Run configuration (where they could appear in logs or config exports), you store them in Secret Manager and Cloud Run retrieves them securely at container start time. The keys are never visible in the Cloud Console UI after being stored.

---

### C) Frontend Build Variables (Vercel / Firebase / any static host)

The frontend is built once (producing static HTML/CSS/JS files) and then hosted. The `VITE_*` variables are **baked into the compiled output** at build time — they are not secret and will be visible in the browser's source code.

| Variable | Where it goes | Safe in browser? | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Frontend hosting env vars | ✅ Yes | Needed by Supabase JS client |
| `VITE_SUPABASE_ANON_KEY` | Frontend hosting env vars | ✅ Yes (RLS protects data) | Low-privilege key |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend hosting env vars | ✅ Yes (referrer-restricted) | Must have referrer restriction set |
| `VITE_API_BASE_URL` | Frontend hosting env vars | ✅ Yes | Set to your Cloud Run service URL |

**On Vercel**: Add these in **Project Settings → Environment Variables → Production**.

**On Firebase Hosting**: Inject them at build time in your CI/CD script or GitHub Actions workflow.

---

### Complete Variable Security Classification

| Variable | Context | In browser? | In GitHub? | Storage |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | ✅ Visible | ❌ Never | Vercel/hosting env |
| `VITE_SUPABASE_ANON_KEY` | Frontend | ✅ Visible | ❌ Never | Vercel/hosting env |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend | ✅ Visible | ❌ Never | Vercel/hosting env |
| `VITE_API_BASE_URL` | Frontend | ✅ Visible | ❌ Never | Vercel/hosting env |
| `NODE_ENV` / `PORT` / `API_BASE_PATH` | Backend | ❌ | ❌ Never | Cloud Run env vars |
| `FRONTEND_URL` | Backend | ❌ | ❌ Never | Cloud Run env vars |
| `SUPABASE_URL` | Backend | ❌ | ❌ Never | Secret Manager |
| `SUPABASE_ANON_KEY` | Backend | ❌ | ❌ Never | Secret Manager |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | ❌ Never | ❌ Never | 🔴 Secret Manager only |
| `GEMINI_API_KEY` | Backend | ❌ Never | ❌ Never | 🔴 Secret Manager only |
| `OPENWEATHER_API_KEY` | Backend | ❌ Never | ❌ Never | 🔴 Secret Manager only |
| `SENTINEL_HUB_CLIENT_ID` | Backend | ❌ Never | ❌ Never | 🔴 Secret Manager only |
| `SENTINEL_HUB_CLIENT_SECRET` | Backend | ❌ Never | ❌ Never | 🔴 Secret Manager only |

---

## ☁️ Deployment Guide — GitHub to Cloud Run

Klimora's **primary production deployment path** connects your GitHub repository directly to Google Cloud Run. You do not need to build Docker images locally. Google Cloud Build handles the entire build-and-deploy pipeline automatically whenever you push code.

### Deployment Architecture

```
  👩‍💻 Developer
       │
       │  git push
       ▼
  ┌─────────────────────┐
  │   GitHub Repository  │   ← Your forked repo
  └──────────┬──────────┘
             │  triggers build
             ▼
  ┌─────────────────────┐
  │  Google Cloud Build  │   ← Compiles TypeScript, builds Docker image
  └──────────┬──────────┘
             │  deploys image
             ▼
  ┌─────────────────────┐
  │  Google Cloud Run    │   ← Runs backend API (auto-scales)
  │  + Secret Manager    │   ← Injects secrets at container start
  └──────────┬──────────┘
             │  reads/writes
             ▼
  ┌─────────────────────┐
  │     Supabase         │   ← PostgreSQL + Auth + Storage
  └─────────────────────┘
             │
  ┌─────────────────────┐
  │  Frontend Hosting    │   ← Vercel / Firebase (separate deployment)
  │  (Vercel / Firebase) │
  └─────────────────────┘
             │
             ▼
       🌍 End Users
```

---

### Deployment Order

> **Always deploy in this exact sequence to avoid broken integrations.**

```
1. ✅ Run Supabase migrations
2. ✅ Verify storage bucket and RLS policies in Supabase
3. ✅ Store all backend secrets in Google Secret Manager
4. ✅ Deploy backend to Cloud Run (from GitHub)
5. ✅ Set FRONTEND_URL in Cloud Run once you have the frontend URL
6. ✅ Deploy frontend to Vercel/Firebase with VITE_* variables set
```

---

### Part 1 — Backend: Deploy to Cloud Run from GitHub

Cloud Run runs your backend as a **serverless container**. Google Cloud Build compiles and containerises the code automatically from your GitHub repository — no local Docker required.

#### Step 1 — Store Secrets in Google Secret Manager

Before deploying, store all backend secrets in Secret Manager. Secrets are injected into your Cloud Run container at start time and never appear in logs or config files.

> **What is Secret Manager?** Think of it as a secure digital vault inside Google Cloud. Instead of typing your API keys into a form (where they could be logged or exported), you store them in the vault and Cloud Run retrieves them securely when the container starts.

```bash
# Install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# Store each secret (replace YOUR_VALUE with the actual secret)
echo -n "YOUR_VALUE" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create SUPABASE_URL --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create SUPABASE_ANON_KEY --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create OPENWEATHER_API_KEY --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create SENTINEL_HUB_CLIENT_ID --data-file=-
echo -n "YOUR_VALUE" | gcloud secrets create SENTINEL_HUB_CLIENT_SECRET --data-file=-
```

#### Step 2 — Deploy Backend to Cloud Run from GitHub

1. Go to [console.cloud.google.com/run](https://console.cloud.google.com/run)
2. Click **"Create Service"**
3. Select **"Continuously deploy from a repository"** → click **"Set up with Cloud Build"**
4. Click **"Connect repository"** → authenticate with GitHub → select your `klimora` fork
5. Set **Branch**: `main` (or whichever is your production branch)
6. Set **Build type**: `Dockerfile`
7. Set **Source location**: `/backend` (the backend subdirectory)
8. Click **"Save"**

Back in the service creation form:

9. **Service name**: `klimora-backend`
10. **Region**: `us-central1` (or closest to your users)
11. **Authentication**: Allow unauthenticated invocations
12. **Container port**: `8080`

Scroll down to **"Container, Networking, Security"** → **"Variables & Secrets"**:

**Add environment variables** (non-sensitive):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `API_BASE_PATH` | `/api/v1` |
| `FRONTEND_URL` | `https://your-frontend-domain.com` |
| `GOOGLE_CLOUD_PROJECT` | `your-gcp-project-id` |
| `GOOGLE_CLOUD_REGION` | `us-central1` |
| `JWT_AUDIENCE` | `klimora-api` |
| `RATE_LIMIT_MAX` | `120` |
| `RATE_LIMIT_WINDOW` | `1 minute` |

**Reference secrets** (click "Reference a Secret" for each):

| Secret name | Exposed as environment variable |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `SUPABASE_URL` | `SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |
| `GEMINI_API_KEY` | `GEMINI_API_KEY` |
| `OPENWEATHER_API_KEY` | `OPENWEATHER_API_KEY` |
| `SENTINEL_HUB_CLIENT_ID` | `SENTINEL_HUB_CLIENT_ID` |
| `SENTINEL_HUB_CLIENT_SECRET` | `SENTINEL_HUB_CLIENT_SECRET` |

13. Click **"Create"**

Cloud Run will immediately trigger a build from your GitHub repo. The first build takes ~3–5 minutes. After completion, Cloud Run gives you a service URL like:

```
https://klimora-backend-xxxxxxxxxx-uc.a.run.app
```

> **What happens on every `git push` now?** Cloud Build detects the push, re-builds the Docker image from the `backend/` directory, and deploys the new revision to Cloud Run automatically. Zero manual steps required after initial setup.

#### Step 3 — Verify the Deployment

Test your backend health endpoint:

```
https://klimora-backend-xxxxxxxxxx-uc.a.run.app/health
→ { "status": "ok", "timestamp": "..." }
```

If it returns `{"status":"ok"}`, your backend is live.

#### Rollback

If a new deployment breaks something:
1. Go to **Cloud Run → klimora-backend → Revisions**
2. Find the last stable revision
3. Click the three-dot menu → **"Route all traffic"** to it
4. Traffic instantly shifts back to the stable version

---

### Part 2 — Frontend: Deploy to Vercel

The frontend is a **static site** (compiled HTML + CSS + JS). After Vite builds it, you get a `dist/` folder that can be hosted on any static hosting provider.

#### Option A — Vercel (Recommended, Easiest)

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Click **"New Project"** → import your `klimora` repository
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Vite`
5. Under **Environment Variables**, add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhb...your-anon-key...` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIza...your-maps-key...` |
| `VITE_API_BASE_URL` | `https://klimora-backend-xxxxxxxxxx-uc.a.run.app/api/v1` |

6. Click **"Deploy"**

Vercel will build and deploy the frontend. You will get a URL like `https://klimora.vercel.app`.

> After getting your Vercel URL, go back to **Cloud Run → klimora-backend → Edit & Deploy New Revision** and update `FRONTEND_URL` to your Vercel URL. This ensures CORS is configured correctly.

#### Option B — Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
cd frontend
firebase init hosting   # set public dir to: dist

# Build with production variables
VITE_SUPABASE_URL=https://... \
VITE_SUPABASE_ANON_KEY=... \
VITE_GOOGLE_MAPS_API_KEY=... \
VITE_API_BASE_URL=https://klimora-backend-xxx.a.run.app/api/v1 \
npm run build

firebase deploy
```

---

## 💻 Local Development Setup (Optional)

> **This section is for developers** who want to run Klimora on their own machine to test changes before pushing to GitHub. If you are only doing a production deployment, this section is not required.

### Prerequisites for Local Dev

- Node.js 22+ installed ([nodejs.org](https://nodejs.org/))
- All credentials from the [Setup Guide](#-setup-guide--get-your-credentials)
- `backend/.env` and `frontend/.env.local` configured (see [Section A of Environment Variables](#a-local-development-variables))

### Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Server listening on http://localhost:8080
```

Test it: Open `http://localhost:8080/health` — you should see `{"status":"ok"}`.

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. The Klimora dashboard should load.

### Useful Dev Commands

```bash
# Backend
npm run dev        # start with hot-reload
npm run typecheck  # check TypeScript without building
npm run build      # compile TypeScript to dist/

# Frontend
npm run dev        # Vite dev server with HMR
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run lint       # ESLint
npm run format     # Prettier
```

---

## 🔐 Security Model

Klimora is designed with security in mind at every layer. Here is a summary of the protections in place:

### Backend Security

| Protection | Implementation |
|---|---|
| **CORS** | Only the configured `FRONTEND_URL` is allowed to make cross-origin requests |
| **Helmet** | HTTP security headers (CSP, referrer policy, CORP) applied to every response |
| **Rate Limiting** | 120 requests per minute per user ID (or IP for anonymous requests) |
| **Input Validation** | All request bodies validated with Zod schemas before processing |
| **Log Redaction** | Authorization headers and passwords are automatically redacted (`***`) from logs |
| **Body Limit** | 5MB global request body limit prevents abuse |

### Database Security

| Protection | Implementation |
|---|---|
| **RLS on all tables** | Every application table has RLS enabled — no exceptions |
| **User data isolation** | Users can only read/write rows where `user_id = auth.uid()` |
| **Points protection** | Users have no INSERT/UPDATE/DELETE on `user_points` — only service role does |
| **Verification protection** | Users cannot create or modify `verification_results` — only AI jobs can |
| **Storage isolation** | Users can only upload to `mission-evidence/{their_user_id}/` paths |
| **Extension whitelist** | Storage policy validates file extensions: `jpg, jpeg, png, mp4, mov` only |

### Secret Management

| Environment | Secret Storage |
|---|---|
| Local development | `.env` files (gitignored) |
| Cloud Run production | Google Secret Manager (injected at container start) |
| Frontend | Only public keys (`VITE_*` prefix) — no secrets ever |

---

## ⏱️ Background Jobs

Klimora's backend runs **scheduled background jobs** that keep the platform's data fresh. These jobs run inside the backend Node.js process and are triggered on a schedule.

| Job | What it does | Frequency |
|---|---|---|
| `ingest-openweather` | Fetches temperature, AQI, rainfall for all localities from OpenWeather | Every hour |
| `ingest-planet` | Fetches NDVI vegetation index from Sentinel Hub via OAuth2 (`SENTINEL_HUB_CLIENT_ID` + `SENTINEL_HUB_CLIENT_SECRET`) | Daily |
| `compute-climate-scores` | Recomputes the composite 0–100 climate health score for all localities | After ingestion |
| `refresh-forecasts` | Pulls 5-day forecasts from OpenWeather and updates the forecasts table | Every 6 hours |
| `refresh-rankings` | Recomputes community leaderboard rankings | Daily |
| `verification-processing` | Processes `submitted` mission submissions through the Gemini verification pipeline | Every 5 minutes |
| `index-retrieval-documents` | Updates the RAG document index for Rit's knowledge retrieval | Daily |
| `cleanup-expired-cache` | Clears stale in-memory cache entries | Every hour |

---

## 🗺️ Future Roadmap

Klimora is actively developed. Planned features include:

### Phase 5 — Expanded Coverage
- [ ] Support for additional Indian cities and districts
- [ ] International city support
- [ ] Ward-level granularity for supported cities

### Phase 6 — Deeper Intelligence
- [ ] Predictive climate risk scoring (30/60/90 day outlook)
- [ ] Seasonal pattern analysis and historical comparison
- [ ] Air quality forecasting with pollutant breakdown
- [ ] Tree canopy change detection (satellite-based)

### Phase 7 — Civic Integration
- [ ] Municipal authority dashboard and data export
- [ ] Direct civic issue reporting integration (311-style)
- [ ] Neighbourhood carbon footprint calculator
- [ ] School and institutional participation programs

### Phase 8 — Community Platform
- [ ] Team missions (group actions)
- [ ] Locality-vs-locality climate improvement challenges
- [ ] Community badges and achievement system
- [ ] Public API for third-party civic applications

### Technical Improvements
- [ ] Supabase Realtime subscriptions for live score updates
- [ ] PWA support (offline access, push notifications)
- [ ] Multi-language support (Hindi, Kannada, Tamil, Telugu)
- [ ] Accessibility audit and WCAG 2.1 AA compliance

---

## 🤝 Contributing

Contributions are welcome! Klimora is a climate-tech project with real civic impact potential. Here is how you can help:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** and follow the [setup guide](#-setup-guide--get-your-credentials)
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** — follow the existing code style
5. **Test your changes** locally
6. **Commit**: `git commit -m "feat: add description of your change"`
7. **Push**: `git push origin feature/your-feature-name`
8. **Open a Pull Request** on GitHub with a clear description of what you changed and why

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
refactor: code refactoring with no behavior change
test: add or update tests
chore: maintenance tasks
```

### Areas Where Help is Most Needed

- 🌍 **New localities**: Adding more cities and wards to the seed data
- 🧪 **Tests**: Backend integration tests and frontend component tests
- 🌐 **Internationalisation**: Adding language support
- ♿ **Accessibility**: Improving screen reader support and keyboard navigation
- 📖 **Documentation**: Improving guides and code comments

### Code Style

- **TypeScript strict mode** — all code must be fully typed
- **Zod validation** — all API inputs must be validated
- **No hardcoded secrets** — never commit credentials
- **RLS discipline** — all new tables must have RLS enabled

### Reporting Issues

Found a bug? Please [open an issue](https://github.com/AnindyaRayAhmed/klimora/issues) with:
- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Environment details (OS, Node version, browser)

---

## 📄 License

Klimora is open source under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 Anindya Ray Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: ...
```

---

<div align="center">

Built with 🌿 for a more climate-resilient future.

**Klimora** — *Every locality has a climate story. Let's make it visible.*

[⭐ Star this repository](https://github.com/AnindyaRayAhmed/klimora) · [🐛 Report an Issue](https://github.com/AnindyaRayAhmed/klimora/issues) · [🤝 Contribute](https://github.com/AnindyaRayAhmed/klimora/pulls)

</div>
