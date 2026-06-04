# InfoSetu: AI-Driven RTI Democratization Engine

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)

An AI-powered CivicTech platform that helps Indian citizens draft legally precise, rejection-proof Right to Information (RTI) applications from everyday language.

---

## About Project

InfoSetu was built and developed as part of the **First Hackathon in Swecha Internship**. It is designed to bridge the gap between grassroots public grievances and complex bureaucratic frameworks.

### Project Ideation Matrix

| Column                                       | Details                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem Statement**                        | Indian citizens face significant barriers when attempting to exercise their constitutional right to information. Legitimate public requests are frequently delayed, ignored, or rejected outright due to improper formatting, missing procedural data, complex legal terminology, and confusion regarding which specific Public Information Officer (PIO) or department holds jurisdiction over the matter.                                          |
| **Current Method of Things**                 | Currently, citizens must manually draft physical or digital applications using rigid formal legalese. They are forced to independently research massive bureaucratic hierarchies to map their issue to the correct department. This process lacks automated validation, resulting in high overhead, error-prone entries, and widespread accessibility barriers for non-legal experts.                                                                |
| **Our Solution**                             | InfoSetu provides an AI-native conversational wizard that abstracts legal complexities away from the end-user. It processes everyday language grievances, uses an adaptive questioning engine to dynamically extract missing structural details, automatically runs classification models to route the issue to the correct administrative authority, and compiles a submission-ready, legally conforming PDF built for immediate upload or postage. |
| **How We Could Make It Better Even Further** | Future enhancements will focus on deploying localized multi-lingual LLM support to cater to regional Indian languages, integrating automated speech-to-text capabilities for increased accessibility, building a direct digital API pipeline with government portals for automated single-click submissions, and introducing autonomous agent-driven tracking systems to monitor legal response deadlines.                                           |

---

## Core Features

- **Plain language to legal draft** — Converts grievances into formal RTI applications
- **Smart department routing** — Maps issues to the correct Public Information Officer (PIO)
- **Saved user profiles** — Reuse name, address, and contact details across filings
- **Adaptive questionnaire** — Category-specific questions (infrastructure, environment, transparency, etc.)
- **One-click PDF export** — Download a ready-to-print RTI document

## Tech Stack

- **Frontend & API:** Next.js 15 (App Router), React 19, Tailwind CSS 4
- **AI:** Groq / Google Gemini (configurable via `LLM_PROVIDER`)
- **Database:** Supabase (PostgreSQL)
- **Testing:** Vitest with coverage reporting

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and add your keys (see [SETUP.md](SETUP.md))
3. Run Supabase SQL scripts: `supabase/setup.sql`, `supabase/user-profiles.sql`, `supabase/rti-adaptive.sql`
4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Development server                 |
| `npm run build`         | Production build                   |
| `npm test`              | Run unit tests                     |
| `npm run test:coverage` | Tests with coverage report         |
| `npm run lint`          | ESLint                             |
| `npm run check-health`  | Verify LLM + Supabase connectivity |

## Documentation

- [SETUP.md](SETUP.md) — Environment and Supabase setup
- [USER_MANUAL.md](USER_MANUAL.md) — End-user guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [AGENTS.md](AGENTS.md) — AI agent architecture
- [SECURITY.md](SECURITY.md) — Security policy
- [CHANGELOG.md](CHANGELOG.md) — Release history

---

## Directory Architecture & Component Responsibilities

The codebase isolates front-end layouts, background workflows, AI prompt layers, and database operations into dedicated functional modules:

- **scripts/** -> Integration health checks and diagnostic utilities
  - `check-api.mjs`
  - `check-health.mjs`
- **supabase/** -> Database migrations and backend trigger logic
  - `setup.sql` -> Primary schema definitions and initialization configurations
  - `rti-adaptive.sql` -> Custom profiling layouts and user data mapping
- **src/app/api/** -> Serverless Application Routing
  - `health/route.ts` -> Status and connectivity endpoint
  - `generate-rti/route.ts` -> Handles profile payload assembly and document validation
  - `rti/categorize/route.ts` -> Automated backend sorting for target government departments
  - `user/` -> Context routes handling user profile data operations
- **src/components/** -> UI Interface Modules
  - `dashboard.tsx` -> The primary user workspace and dashboard container
  - `rti-confirm-screen.tsx` -> Final proofing view with an integrated rich-text interface
  - `rti-history-panel.tsx` -> Interactive grid displaying a user's previous filings
  - `user-detail/` -> Interactive modals and input fields for identity updates
- **src/hooks/** -> Custom React Lifecycle Hooks
  - `use-user-profiles.ts` -> Client-side state hook abstraction managing profile database queries
- **src/lib/** -> Core Utilities & Static Assets
  - `prompts.ts` -> Master LLM instruction sets and context rules
  - `rti-categories.ts` -> Structured indexes of target government departments
  - `rti-template.ts` -> Standard legal layout parameters and text injection parsers

---

## Local Development Setup

### 1. Prerequisites

Ensure your machine has the following tools installed:

- Node.js (v18.x or above)
- A package manager like npm or yarn
- A running Supabase instance (either via local Docker containers or hosted cloud project)

### 2. Environment Configuration (`.env.local`)

Create a `.env.local` configuration file in the project root and provide your service credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_string
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_key
OPENAI_API_KEY=your_openai_or_llm_provider_secret_token
```

### 3. Schema Setup

Run the setup queries directly inside your Supabase SQL Editor to provision the necessary tables and constraints:

1. Copy and execute the contents of `supabase/setup.sql` to build the foundational architecture.
2. Execute the contents of `supabase/rti-adaptive.sql` to initialize the dynamic profiling features.

### 4. Running the Project Locally

Initialize dependencies and boot up the local server with the following terminal commands:

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` in your web browser to test the local interface.

---

## Validation & Testing

The system includes pre-deployment validation tools to check system health and API functionality:

- Execute the suite of unit tests: `npm run test`
- Verify external API service availability: `node scripts/check-health.mjs`
- Check pipeline parameter integrations: `node scripts/check-api.mjs`

---

## Development Workflow & Contribution Guidelines

To maintain clean project delivery, development is divided into specialized feature branches:

1. **User Interface** (`frontend-adaptive-ui` / `frontend-ui`): Focused on application screens, form inputs, and interactive text boundaries.
2. **AI Categorization** (`feature-rti-categorization`): Manages prompt tuning, response parsing, and classification accuracy.
3. **Infrastructure** (`backend-rti-adaptive` / `backend-infra`): Controls user database states, secure data updates, and server execution pipelines.

Please run `npm run lint` to enforce formatting guidelines before pushing commits, and keep all updates restricted to your team's designated paths.

---

## Contributors

- **Shreyas** — **Frontend Adaptations Layout**
  - Engineered the interactive multi-step dashboard shell (`dashboard.tsx`) and verification boundary. Implemented the text editing suite inside `rti-confirm-screen.tsx`, built modular identity update forms within `user-detail/`, and handled client-side UI state tracking.
- **Jayaditya** — **Core AI & Categorization Engine**
  - Authored system context anchors, instructional prompt logic, and evaluation boundaries within `prompts.ts`. Programmed the asynchronous serverless categorization engine (`api/rti/categorize/route.ts`) and engineered algorithmic data parsing fallback patterns.
- **Arrya Sridhar** — **Backend Infrastructure & Database Routing**
  - Built foundational Supabase database migrations (`setup.sql`), established secure table triggers, deployed adaptive profile schema definitions (`rti-adaptive.sql`), and developed the relational query interface hook `use-user-profiles.ts`.

---

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE) (AGPL-3-or-later).
