# Feature Specification: Department Routing

**Feature Branch**: `002-department-routing`
**Status**: Implemented

## User Scenarios & Testing

### User Story 1 - Auto-route to correct department (Priority: P1)

As a citizen, I want the system to identify which government department my RTI
application should be sent to.

**Acceptance Scenarios**:

1. **Given** a grievance about roads, **When** draft is generated, **Then** the
   target department references municipal/PWD authority.
2. **Given** an ambiguous grievance, **When** no match is found, **Then** a general
   PIO fallback is used.

## Requirements

### Functional Requirements

- **FR-001**: System MUST analyze the core entity of the grievance.
- **FR-002**: System MUST map to local, state, or central ministry/department.
- **FR-003**: System MUST include department name in the generated application.

## Success Criteria

- **SC-001**: Department routing succeeds for all supported category keywords.
