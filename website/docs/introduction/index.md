# Introduction to RouteCase

**RouteCase** is a lightweight, zero-configuration API testing extension built specifically for Visual Studio Code. It allows developers to define HTTP endpoints and test cases in declarative `.rcase` JSON documents, execute requests directly inside the editor with one click, and inspect results without leaving their coding flow.

---

## The Problem RouteCase Solves

Traditional API testing tools force developers into one of two extremes:

1. **Heavy External Desktop Clients (e.g. Postman, Insomnia):**
   - High memory footprint and slow startup times.
   - Separate windows that break editor focus.
   - Forced cloud accounts, team limits, and telemetry.
   - Proprietary collection formats that don't diff cleanly in Git pull requests.

2. **Basic `.http` or cURL Files:**
   - Difficult to run structured assertions on response payloads.
   - No built-in expansion of multiple success and error scenarios for a single route.
   - Manual copying and pasting of authentication tokens across requests.
   - Lack of deep JSON comparison and automated latency benchmarks.

**RouteCase bridges this gap.** It gives you the speed and cleanliness of local Git-committed JSON files combined with the rich testing capabilities of full test runners.

---

## Core Capabilities at a Glance

<div v-pre class="rc-capability-grid">
<div class="rc-capability-card">
  <div class="rc-cap-header">
    <div class="rc-cap-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
    <h3 class="rc-cap-title">Authoring & Suites</h3>
  </div>
  <ul class="rc-cap-list">
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Declarative <code>.rcase</code> JSON</strong> with full VS Code schema validation</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Multi-case suites</strong> cleanly partitioned into <code>success</code> and <code>errors</code></span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Environment files</strong> (<code>.rcase.env</code>, <code>.rcase.env.json</code>)</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Dynamic data generators</strong> (<code>{{$uuid}}</code>, <code>{{$timestamp}}</code>, <code>{{$randomEmail}}</code>)</span></li>
  </ul>
</div>
<div class="rc-capability-card">
  <div class="rc-cap-header">
    <div class="rc-cap-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
    <h3 class="rc-cap-title">Interactive Runtime</h3>
  </div>
  <ul class="rc-cap-list">
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Jupyter-style CodeLens</strong> actions above every endpoint and test case</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Sequential suite runner</strong> with immediate abort on cancel</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Isolated scenario testing</strong> without running unrelated routes</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Response variable chaining</strong> (<code>capture</code>) across tests</span></li>
  </ul>
</div>
<div class="rc-capability-card">
  <div class="rc-cap-header">
    <div class="rc-cap-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg></div>
    <h3 class="rc-cap-title">Validation & Safety</h3>
  </div>
  <ul class="rc-cap-list">
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Multi-level assertions</strong>: HTTP status, deep JSON equality, substrings</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Latency benchmarks</strong> with strict <code>maxDurationMs</code> SLA limits</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Automatic secret masking</strong> for <code>Authorization</code> and sensitive headers</span></li>
    <li class="rc-cap-item"><span class="rc-cap-dot">✓</span> <span><strong>Native OpenAPI / Swagger importer</strong> for zero-effort suite creation</span></li>
  </ul>
</div>
</div>

- **Declarative `.rcase` Documents:** One endpoint can define multiple `success` cases (valid inputs, different roles) and multiple `errors` cases (invalid IDs, missing fields, unauthorized tokens).
- **Inline Cell Actions (Jupyter-Style):** Click `▶ Run Case` above any individual scenario to run it in isolation, with instant visual feedback badges (`✓ PASS 200 • 35ms`).
- **Response Variable Chaining:** Automatically capture values from responses (e.g. JWT access tokens or newly created entity IDs) and inject them into subsequent test requests.
- **Environment Profiles:** Seamlessly switch between `local`, `staging`, and `production` environments using `.rcase.env` files without altering test files.
- **Dynamic Data Generators:** Generate random UUIDs (`{{$uuid}}`), timestamps (`{{$timestamp}}`), emails (`{{$randomEmail}}`), and dates on the fly.
- **Security-First Design:** Headers containing credentials (`Authorization`, `Cookie`, `x-api-key`) are automatically redacted in test reports and UI views.
- **OpenAPI & Swagger Importer:** Instantly scaffold test suites from existing OpenAPI 3.x and Swagger 2.x specifications.

---

## Supported Environments & Requirements

- **Visual Studio Code:** Version `1.90.0` or higher.
- **Operating Systems:** Windows 10/11, macOS (Intel & Apple Silicon), Linux (Ubuntu, Debian, Fedora, Arch).
- **Network Access:** Any local HTTP/HTTPS server (`localhost:3000`, `127.0.0.1:8080`), local network services, or internet-accessible APIs.
- **Runtime Dependencies:** Zero external runtime dependencies. Node.js built-ins power the entire execution engine.
