# InfoSetu: AI-Driven RTI Democratization Engine

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)

An AI-powered CivicTech platform that helps Indian citizens draft legally precise, rejection-proof Right to Information (RTI) applications from everyday language.

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

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE) (AGPL-3-or-later).

---

## System Overview

InfoSetu is an AI-native utility built to streamline access to India's Right to Information (RTI) Act, 2005. The application translates conversational, localized citizen inputs into the highly structured, formal language required for public records requests. By demystifying bureaucratic protocols, InfoSetu handles everything from automated legal text generation and department classification to user profile management and ready-to-submit PDF compilation.

---

## Key Core Features

- **Dynamic Questioning Framework:** Interviews users based on their initial input to extract specific details without requiring upfront legal knowledge.
- **Intelligent Routing & Prompting:** Utilizes targeted classification models to identify the correct government departments and Public Information Officers (PIOs).
- **Stateful Profile Management:** Saves user credentials securely, allowing citizens to safely store, edit, and apply different profile variations across multiple applications.
- **Local Document Rendering:** Compiles finalized, legally compliant PDFs ready for digital portal upload or immediate postal mailing.

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

## Development Workflow

To maintain clean project delivery, development is divided into specialized feature branches:

1. **User Interface** (`frontend-adaptive-ui` / `frontend-ui`): Focused on application screens, form inputs, and interactive text boundaries.
2. **AI Categorization** (`feature-rti-categorization`): Manages prompt tuning, response parsing, and classification accuracy.
3. **Infrastructure** (`backend-rti-adaptive` / `backend-infra`): Controls user database states, secure data updates, and server execution pipelines.

Please run `npm run lint` to enforce formatting guidelines before pushing commits, and keep all updates restricted to your team's designated paths.
