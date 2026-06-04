# Feature: RTI Application Drafting

## Summary

AI-powered conversion of unstructured citizen grievances into formally valid
RTI applications conforming to the RTI Act, 2005.

## User Story

As a citizen, I want to describe my grievance in plain language so that the
system generates a legally valid RTI application I can submit to the
appropriate public authority.

## Acceptance Criteria

- [x] User can input grievance text in free-form
- [x] AI agent restructures input into numbered, objective questions
- [x] Emotional or irrelevant statements are filtered out
- [x] Output conforms to standard RTI filing format
- [x] Department routing suggests the correct authority

## Technical Notes

- Uses the Legal Draftsman Agent (Gemini-powered prompt pipeline)
- Department Routing Agent identifies the correct ministry/department
- PDF export available via jsPDF + html2canvas

## Testing Requirements

- [x] Unit tests for prompt formatting utilities
- [ ] Integration test for end-to-end draft generation
- [ ] Manual verification of output quality with sample inputs
