# InfoSetu: AI-Driven RTI Democratization Engine

InfoSetu is an AI-native platform engineered to democratize access to the Right to Information (RTI) Act, 2005. By translating conversational, localized user inputs into legally precise, structured public records requests, InfoSetu bridges the gap between raw citizen grievances and complex administrative frameworks. The platform automates legal prose generation, optimizes department categorization, handles stateful user profiles, and exports submission-ready statutory documentation.

---

## Key Architectural Features

* **Adaptive Questionnaire Engine:** Dynamically interviews citizens based on their initial grievance to extract necessary technical details without legal jargon.
* **AI Categorization & Prompt Engineering:** Employs advanced classification models to route applications to the correct administrative authority and public departments.
* **User-Aware Profile Injection:** Persists stateful user detail sets allowing individuals to manage, track, edit, and safely deploy distinct profiles across multiple applications.
* **Client-Side Document Compilation:** Generates localized, legally conforming PDFs built for rapid manual postage or direct uploads to digital portals.

---

## Repository Structure & Module Responsibility

The repository is organized into distinct functional layers separating core AI modules, API routes, stateful backend logic, and UI rendering components:

* **scripts/** -> Automated backend testing and network validation diagnostics
  * check-api.mjs
  * check-health.mjs
* **supabase/** -> Database schema migrations and relational triggers
  * setup.sql -> Base system table definitions and operational configurations
  * rti-adaptive.sql -> Dynamic adaptive profiling structures and user data mapping
* **src/app/api/** -> Asynchronous Routing Engine
  * health/route.ts -> Microservice diagnostic endpoint
  * generate-rti/route.ts -> Profile injection workflow and validation payload logic
  * rti/categorize/route.ts -> Automated governmental department classifier
  * user/ -> Direct state management routes for data operations
* **src/components/** -> UI Layer Architecture
  * dashboard.tsx -> Main application workspace dashboard shell
  * rti-confirm-screen.tsx -> Verification boundary with integrated text editor
  * rti-history-panel.tsx -> Relational record matrix displaying historic submissions
  * user-detail/ -> Components handling dynamic entry updates and modal windows
* **src/hooks/** -> Stateful Custom Utilities
  * use-user-profiles.ts -> React client abstraction layer controlling background actions
* **src/lib/** -> Engine Core Logic Assets
  * prompts.ts -> System prompts, instruction frameworks, and context anchors
  * rti-categories.ts -> Complete departmental code indexes and operational paths
  * rti-template.ts -> Static legal headers and algorithmic processing strings

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed locally:
* Node.js (v18.x or higher)
* npm or yarn package management
* A running Supabase instance (Local Docker configuration or hosted cloud project)

### 2. Environment Setup (.env.local)
Create a file named `.env.local` in the root directory and populate it with your environment variables:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_string
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_key
OPENAI_API_KEY=your_openai_or_llm_provider_secret_token

### 3. Database Initialization
Execute the foundational configuration scripts against your Supabase database using the SQL editor to instantiate target tables, constraints, and relational dependencies:

* Execution 1: Open the SQL Editor and run all code inside `supabase/setup.sql`.
* Execution 2: Run all code inside `supabase/rti-adaptive.sql` to deploy adaptive profiling layers.

### 4. Dependency Installation & Local Development
Run the following terminal commands sequentially to deploy your local web application:

npm install
npm run dev

Open http://localhost:3000 with your browser to monitor the active portal interface.

---

## Testing and Quality Control

The project uses modular end-to-end assertions and validation scripts to guarantee system integrity before staging deployments:

* Run structural processing unit tests: `npm run test`
* Execute network/API availability checks: `node scripts/check-health.mjs`
* Check pipeline parameter settings: `node scripts/check-api.mjs`

---

## Contribution Guidelines

This repository relies on structured branch-level deliveries mapped out across distinct functional domains:

1. Frontend Adaptations (frontend-adaptive-ui / frontend-ui): Handles interactive client states, responsive panel distributions, and accessible text boundaries.
2. Core Categorization (feature-rti-categorization): Governs strict operational prompts, domain classifiers, and parsing schemas.
3. Backend Infrastructure (backend-rti-adaptive / backend-infra): Controls server-side profile handling, relational persistence, and transactional execution security.

Ensure your code is properly formatted via 'npm run lint' before committing files, and isolate your changes strictly to your team's assigned directories.