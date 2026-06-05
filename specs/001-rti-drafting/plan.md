# Implementation Plan: RTI Application Drafting

**Branch**: `001-rti-drafting` | **Spec**: [spec.md](./spec.md)

## Summary

AI-powered conversion of unstructured citizen grievances into formally valid RTI
applications using the Legal Draftsman Agent (Groq/Gemini LLM pipeline).

## Constitution Check

- Accessibility: plain-language input, government-style output
- Accuracy: RTI Act 2005 conforming templates
- Privacy: user details collected explicitly before generation
- Quality gates: unit tests in `src/lib/rti-template.test.ts`

## Technical Context

**Language**: TypeScript / Next.js 15
**AI**: Groq (primary), Gemini (fallback) via `/api/generate-rti`
**Storage**: Supabase `rti_applications` table
**Export**: jsPDF + html2canvas

## Project Structure

```text
src/
├── app/api/generate-rti/route.ts
├── components/rti-preview.tsx
├── lib/llm/
├── lib/rti-template.ts
└── lib/pdf-export.ts
```
