# RTI-Ease — Project Constitution

## Mission

RTI-Ease is an AI-powered CivicTech platform that empowers Indian citizens to exercise
their Right to Information by simplifying the process of drafting, routing, and filing
RTI applications.

## Core Principles

1. **Accessibility** — The platform must be usable by citizens regardless of legal
   literacy, language proficiency, or technical skill.
2. **Accuracy** — AI-generated legal drafts must conform to the RTI Act, 2005 and
   produce formally valid applications.
3. **Privacy** — User data (grievances, personal details) must never be stored beyond
   the active session unless the user explicitly opts in.
4. **Open Source** — All source code is released under AGPLv3 to guarantee community
   ownership and auditability.

## Architecture Decisions

| Decision           | Choice                  | Rationale                   |
| ------------------ | ----------------------- | --------------------------- |
| Frontend Framework | Next.js 15 (App Router) | SSR + SEO for public pages  |
| AI Provider        | Groq / Gemini           | Multi-model flexibility     |
| Auth & DB          | Supabase                | OSS-friendly, self-hostable |
| Styling            | Tailwind CSS v4         | Rapid prototyping           |
| Testing            | Vitest                  | Fast, TS-native             |

## Agents

### Legal Draftsman Agent

Translates unstructured citizen inputs into formal legal prose conforming to
standard RTI filing requirements.

### Department Routing Agent

Categorizes the issue domain and matches it to the correct administrative
body (local, state, or central ministry).

## Quality Gates

- All PRs must pass lint, format, type-check, and test stages in CI.
- Coverage must not drop below the enforced threshold.
- Security scanning (Gitleaks) must pass before merge.
