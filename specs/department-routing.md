# Feature: Department Routing

## Summary

Automatic identification and routing of RTI applications to the correct
government department based on the subject matter of the grievance.

## User Story

As a citizen, I want the system to automatically identify which government
department my RTI application should be sent to, so that I don't have to
research the correct authority myself.

## Acceptance Criteria

- [x] System analyzes the core entity of the grievance (roads, budgets, environment, etc.)
- [x] Matches grievance to the respective local, state, or central ministry/department
- [x] Provides department name and address in the generated application
- [ ] Supports all major central ministries and state departments

## Technical Notes

- Uses the Department Routing Agent
- Categorization based on keyword/entity extraction from user input
- Fallback to general PIO (Public Information Officer) if no match found

## Testing Requirements

- [x] Unit tests for department matching logic
- [ ] Coverage of all supported department categories
- [ ] Edge case testing for ambiguous grievances
