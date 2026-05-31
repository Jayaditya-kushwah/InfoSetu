# InfoSetu: AI-Driven RTI Democratization Engine

InfoSetu is an AI-native platform engineered to democratize access to the Right to Information (RTI) Act, 2005. By translating conversational, localized user inputs into legally precise, structured public records requests, InfoSetu bridges the gap between raw citizen grievances and complex administrative frameworks. The platform automates legal prose generation, optimizes department categorization, handles stateful user profiles, and exports submission-ready statutory documentation.

---

## 🛠️ Key Architectural Features

* **Adaptive Questionnaire Engine:** Dynamically interviews citizens based on their initial grievance to extract necessary technical details without legal jargon.
* **AI Categorization & Prompt Engineering:** Employs advanced classification models to route applications to the correct administrative authority and public departments.
* **User-Aware Profile Injection:** Persists stateful user detail sets allowing individuals to manage, track, edit, and safely deploy distinct profiles across multiple applications.
* **Client-Side Document Compilation:** Generates localized, legally conforming PDFs built for rapid manual postage or direct uploads to digital portals.

---

## 📁 Repository Structure & Module Responsibility

The repository is organized into distinct functional layers separating core AI modules, API routes, stateful backend logic, and UI rendering components:

├── scripts/                          # Automated backend testing & network checks
│   ├── check-api.mjs
│   └── check-health.mjs
├── supabase/                         # Database schema migrations & relational triggers
│   ├── setup.sql                     # Base infrastructure definition
│   └── rti-adaptive.sql              # Adaptive questionnaire & user detail tables
├── src/
│   ├── app/
│   │   └── api/                      # Asynchronous API Layer
│   │       ├── health/route.ts       # Health checks
│   │       ├── generate-rti/route.ts # Profile injection & final compilation
│   │       ├── rti/categorize/       # AI routing & categorization engine
│   │       └── user/                 # Stateful profile management paths
│   ├── components/                   # Frontend UI Components
│   │   ├── dashboard.tsx             # Central user hub
│   │   ├── rti-confirm-screen.tsx    # Live draft editor & verification interface
│   │   ├── rti-history-panel.tsx     # Past applications tracking matrix
│   │   └── user-detail/              # Adaptive forms and profile cards
│   ├── hooks/
│   │   └── use-user-profiles.ts      # Custom client state hook for profile management
│   └── lib/                          # Core System Utilities
│       ├── prompts.ts                # Structured prompt declarations & legal hints
│       ├── rti-categories.ts         # Authority routing configurations
│       ├── rti-template.ts           # Legislative string interpolators & tests
│       └── supabase/                 # Client & server data access layers

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed locally:
* Node.js (v18.x or higher)
* npm or yarn
* A running Supabase instance (Local Docker container or hosted cloud project)

### 2. Configuration (.env.local)
Create a file named .env.local in the root directory and populate it with your infrastructure variables:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_key
OPENAI_API_KEY=your_openai_or_llm_provider_secret_token

### 3. Database Initialization
Execute the foundational configuration scripts against your Supabase database using the SQL editor to instantiate target tables, constraints, and relational dependencies:

# 1. Run supabase/setup.sql to initialize primary infrastructure tables.
# 2. Run supabase/rti-adaptive.sql to enable user profiling and adaptive structures.

### 4. Dependency Installation & Local Development
# Install package dependencies
npm install

# Spin up the local next.js development server
npm run dev

Open http://localhost:3000 with your browser to see the running portal.

---

## 🧪 Testing and Quality Control

The project uses modular end-to-end assertions and validation scripts to guarantee system integrity before staging deployments:

# Run unit tests verifying prompt templating and structural categorization rules
npm run test

# Execute runtime health diagnostics on API configurations
node scripts/check-health.mjs
node scripts/check-api.mjs

---

## 🤝 Contribution Guidelines

This repository relies on structured branch-level deliveries mapped out across distinct functional domains:

1. Frontend Adaptations (frontend-adaptive-ui / frontend-ui): Handles interactive client states, responsive panel distributions, and accessible text boundaries.
2. Core Categorization (feature-rti-categorization): Governs strict operational prompts, domain classifiers, and parsing schemas.
3. Backend Infrastructure (backend-rti-adaptive / backend-infra): Controls server-side profile handling, relational persistence, and transactional execution security.

Ensure your code is properly formatted via 'npm run lint' before committing files, and isolate your changes strictly to your team's assigned directories.