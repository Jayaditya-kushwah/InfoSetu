# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security issue in RTI-Ease, please report it responsibly:

1. **Do not** open a public issue with exploit details.
2. Email the maintainers or open a confidential issue on the project tracker if available.
3. Include steps to reproduce, affected components, and potential impact.

We aim to acknowledge reports within **7 days** and provide a fix or mitigation plan within **30 days** for confirmed issues.

## Security Practices for Contributors

- Never commit `.env` files, API keys, or Supabase service role keys.
- Use `.env.example` for documented variables only.
- Run `npm audit` before releases and address high/critical findings.
- Pre-commit hooks scan for accidental secret patterns.

## Scope

In scope: application code, API routes, dependency vulnerabilities, and misconfigured public environment variables.

Out of scope: third-party LLM provider outages, Supabase platform issues, and social engineering.
