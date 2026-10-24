# Project Architecture & Workflow

RouteCase is built with a modular, lightweight TypeScript architecture designed for deterministic execution, zero telemetry, and maximum developer feedback speed.

---

## High-Level Architecture Diagram

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      VS Code Front-End                      │
 ├───────────────────────────────┬─────────────────────────────┤
 │ • CodeLens Provider & Scanner │ • Activity Bar Tree Provider│
 │ • Webview Results Panel       │ • Context Menu (Copy cURL)  │
 └──────────────┬────────────────┴──────────────┬──────────────┘
                │                               │
                ▼                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    RouteCase Core Engine                    │
 ├───────────────────────────────┬─────────────────────────────┤
 │ 1. Parser & Schema Validator  │ 2. Template & URL Expander  │
 │ 3. Environment Resolver (.env)│ 4. Variable Chaining Store  │
 │ 5. Dynamic Built-in Generators│ 6. Secret Redactor          │
 │ 7. Assertion Evaluator        │ 8. HTTP/HTTPS Executor      │
 └───────────────────────────────┴─────────────────────────────┘
                │
                ▼
      Target HTTP/HTTPS API (Localhost / Remote)
```

---

## Architectural Subsystems

### 1. Parser & Validator (`src/parser/parser.ts`)
- Parses raw text content using Node's JSON parser.
- Enforces strict Draft-07 schema compliance.
- Ensures all mandatory keys (`baseUrl`, `tests`, `name`, `method`, `path`, `expect.status`) are valid before any network socket is opened.

### 2. URL & Template Engine (`src/engine/template.ts`)
- Implements RFC-compliant WHATWG URL construction.
- Resolves `{placeholder}` syntax in both path templates (`/api/users/{id}`) and query templates (`/search?q={query}`).
- Correctly separates pathnames from query strings, avoiding the `%3F` query bug.
- Encodes individual parameter values safely, preserving reserved characters where appropriate.

### 3. Execution & Networking Engine (`src/engine/executor.ts`)
- Sequential test execution using Node's built-in `http` and `https` modules.
- Zero external runtime dependencies.
- Automatic content-type detection and content-length calculation.
- Request timeout management and cancellation abort signals.
- Safe cross-origin redirect prevention.

### 4. Secret Redaction Engine (`src/engine/redaction.ts`)
- Case-insensitive scanning of sensitive request and response headers (`Authorization`, `Cookie`, `x-api-key`, `token`, `secret`).
- Replaces values with `[REDACTED]` prior to logging or sending data to the Webview results panel.
- Truncates oversized response previews to prevent editor slowdown.

### 5. Assertion Engine (`src/engine/assertions.ts`)
- Evaluates expected vs actual HTTP status codes.
- Performs substring search (`bodyContains`).
- Performs deep recursive object and array equality (`bodyEquals`).
- Asserts presence and exact values of expected response headers.
- Measures and validates elapsed latency against `maxDurationMs`.
