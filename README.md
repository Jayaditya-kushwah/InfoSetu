# RTI-Ease

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint |
| `npm run check-health` | Verify LLM + Supabase connectivity |

## Documentation

- [SETUP.md](SETUP.md) — Environment and Supabase setup
- [USER_MANUAL.md](USER_MANUAL.md) — End-user guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- [AGENTS.md](AGENTS.md) — AI agent architecture
- [SECURITY.md](SECURITY.md) — Security policy
- [CHANGELOG.md](CHANGELOG.md) — Release history

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE) (AGPL-3.0-or-later).
