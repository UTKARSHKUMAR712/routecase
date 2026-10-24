---
name: technical-documentation
description: Standards and patterns for authoring authoritative, production-grade developer documentation portals, API references, tutorials, and troubleshooting guides.
---

# Technical Documentation Guidelines

## Principles of Exceptional Developer Docs
1. **Accuracy & Truth to Source:** Every endpoint, schema property, command, and assertion must be verified against real implementation code. Never invent fictive flags or imaginary parameters.
2. **Information Architecture (Diátaxis Framework):**
   - **Tutorials:** Learning-oriented, step-by-step journeys for beginners (e.g., "First Test Suite in 3 Minutes").
   - **How-To Guides / Recipes:** Task-oriented solutions for specific problems (e.g., "Testing Authenticated JWT Routes", "Query Parameter Pagination").
   - **Reference:** Information-oriented, comprehensive, exact specifications (e.g., `.rcase` Schema Reference, Assertions Matrix, CLI Commands).
   - **Explanation / Concepts:** Understanding-oriented architecture and mental models (e.g., "Variable Resolution Order", "Request Lifecycle").

## Schema & Reference Documentation Pattern
Every documented field must provide:
- **Field Name & Type:** e.g., `maxDurationMs` (`number`, integer >= 1)
- **Requirement:** Required vs Optional (with default value if any)
- **Description:** Clear explanation of what the field controls.
- **Valid Example:** Practical JSON snippet showing proper usage.
- **Validation Rules & Failure Behavior:** What happens when omitted or invalid.

## Callouts & Admonitions
- **NOTE:** Contextual background or extra information.
- **TIP:** Productivity boosters and best practices.
- **WARNING:** Common pitfalls, syntax traps, or deprecation notices.
- **DANGER:** Breaking configurations or security implications.
