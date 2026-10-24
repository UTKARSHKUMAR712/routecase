# Project Architecture & Workflow

RouteCase is built with a modular, lightweight TypeScript architecture designed for deterministic execution, zero telemetry, and maximum developer feedback speed.

---

## High-Level Architecture

<div v-pre class="rc-arch-stack">
<div class="rc-arch-layer">
  <div class="rc-arch-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> Layer 1: VS Code Front-End & Extensibility UI</div>
  <div class="rc-arch-grid">
    <div class="rc-arch-item">CodeLens Provider & Scanner</div>
    <div class="rc-arch-item">Activity Bar Tree Provider</div>
    <div class="rc-arch-item">Webview Results Panel (XSS-safe)</div>
    <div class="rc-arch-item">cURL Generator & Context Menus</div>
  </div>
</div>
<div class="rc-arch-connector">▼ &nbsp; Dispatches In-Memory Events & Commands</div>
<div class="rc-arch-layer">
  <div class="rc-arch-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg> Layer 2: RouteCase Core Execution Engine (Node.js)</div>
  <div class="rc-arch-grid">
    <div class="rc-arch-item">1. Parser & Schema Validator</div>
    <div class="rc-arch-item">2. Template & URL Expander</div>
    <div class="rc-arch-item">3. Environment Resolver (.env)</div>
    <div class="rc-arch-item">4. Variable Chaining Store</div>
    <div class="rc-arch-item">5. Dynamic Generators ({{$uuid}})</div>
    <div class="rc-arch-item">6. Secret Redaction Engine</div>
    <div class="rc-arch-item">7. Multi-Level Assertion Evaluator</div>
    <div class="rc-arch-item">8. HTTP/HTTPS Native Socket Client</div>
  </div>
</div>
<div class="rc-arch-connector">▼ &nbsp; Zero-Dependency HTTP / HTTPS Network Sockets</div>
<div class="rc-arch-layer" style="border-style: dashed;">
  <div class="rc-arch-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Target API (Localhost :3000 / Docker / LAN / Remote Web API)</div>
</div>
</div>

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
