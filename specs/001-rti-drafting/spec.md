# Feature Specification: RTI Application Drafting

**Feature Branch**: `001-rti-drafting`
**Status**: Implemented

## User Scenarios & Testing

### User Story 1 - Draft RTI from grievance (Priority: P1)

As a citizen, I want to describe my grievance in plain language so that the system
generates a legally valid RTI application I can submit to the appropriate authority.

**Acceptance Scenarios**:

1. **Given** a citizen enters a grievance, **When** they submit the form, **Then** a
   formal RTI draft is generated with numbered questions.
2. **Given** emotional language in input, **When** the draft is generated, **Then**
   only factual requests are retained.

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept free-form grievance text (English/Hindi).
- **FR-002**: System MUST restructure input into numbered, objective RTI questions.
- **FR-003**: System MUST filter emotional or irrelevant statements.
- **FR-004**: System MUST produce PDF-exportable output conforming to RTI Act, 2005.

## Success Criteria

- **SC-001**: Users can generate a complete RTI draft in under 30 seconds.
- **SC-002**: Generated drafts include subject, addressee, and statutory references.
