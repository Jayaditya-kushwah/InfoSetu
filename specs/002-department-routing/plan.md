# Implementation Plan: Department Routing

**Branch**: `002-department-routing` | **Spec**: [spec.md](./spec.md)

## Summary

Automatic identification and routing of RTI applications to the correct government
department using the Department Routing Agent and category classification.

## Constitution Check

- Accuracy: correct PIO/department improves application validity
- Accessibility: citizens need not research authorities manually

## Technical Context

**Classification**: `src/lib/rti-categories.ts` keyword/entity matching
**AI routing**: Department Routing prompt in `src/lib/prompts.ts`
**API**: `/api/rti/categorize`

## Project Structure

```text
src/
├── lib/rti-categories.ts
├── lib/prompts.ts
└── app/api/rti/categorize/route.ts
```
