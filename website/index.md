---
layout: home

hero:
  name: "RouteCase"
  text: "API Testing Reimagined for VS Code"
  tagline: "Define endpoints once in declarative .rcase files. Run multiple input cases with one click. Zero context switching, zero cloud bloat."
  image:
    src: /logo-512.png
    alt: RouteCase Official Highway-R Logo
  actions:
    - theme: brand
      text: Install for VS Code
      link: https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase
    - theme: alt
      text: Explore Documentation →
      link: /docs/introduction/

features:
  - icon: ⚡
    title: Jupyter-Style Inline Execution
    details: Floating CodeLens actions above every route and case. Click "▶ Run All Cases", "▶ Run Endpoint", or "▶ Run Case" with live in-editor status badges.
  - icon: 🔗
    title: Response Variable Chaining
    details: Extract JWT tokens or generated IDs from response bodies and auto-inject them into downstream requests. Perfect for complex authenticated flows.
  - icon: 🌍
    title: Environment Isolation (.env)
    details: Switch between localhost, staging, and production seamlessly with .rcase.env or .rcase.env.json. Never commit secrets to Git.
  - icon: 🎲
    title: Built-in Dynamic Generators
    details: Inject {{$uuid}}, {{$randomEmail}}, {{$timestamp}}, {{$randomName}}, and {{$isoDate}} to execute idempotent mutation tests without 409 conflicts.
  - icon: 📋
    title: Right-Click "Copy as cURL"
    details: Instantly export any test case as an executable cURL command for terminal debugging, team collaboration, or bug reporting.
  - icon: 📥
    title: OpenAPI / Swagger Auto-Import
    details: Convert OpenAPI 3.x and Swagger 2.x JSON specifications directly into executable RouteCase test suites with zero manual typing.
---

<div class="hero-badge">
  <span>🚀 v0.2.0 Released</span>
  <span>•</span>
  <span>OpenAPI Import & Response Chaining Now Live</span>
</div>

## The In-Editor Testing Experience

Say goodbye to bloated Electron apps, heavy memory footprints, and manual token copy-pasting. RouteCase runs natively inside your Visual Studio Code editor:

<div class="rc-mockup-window">
  <div class="rc-mockup-titlebar">
    <div class="rc-mockup-dots">
      <span class="rc-dot-red"></span>
      <span class="rc-dot-yellow"></span>
      <span class="rc-dot-green"></span>
    </div>
    <span class="rc-mockup-filename">api-suite.rcase — RouteCase Editor</span>
  </div>
  <div class="rc-mockup-body">
    <div class="codelens-row">
      <span class="codelens-action">▶ Run All Cases (9)</span>
      <span class="codelens-action">📊 Open Results Dashboard</span>
    </div>
    <pre><code><span style="color:#64748B">// Base configuration loaded from .rcase.env</span>
{
  <span style="color:#34D399">"baseUrl"</span>: <span style="color:#FCD34D">"{{API_BASE_URL}}"</span>,
  <span style="color:#34D399">"headers"</span>: { <span style="color:#34D399">"x-api-key"</span>: <span style="color:#FCD34D">"{{API_KEY}}"</span> },
  <span style="color:#34D399">"tests"</span>: [</code></pre>
    <div class="codelens-row" style="margin-left: 1.5rem;">
      <span class="codelens-action">▶ Run Endpoint (POST /auth/login)</span>
      <span class="badge-pass">✓ PASS (200 • 38ms)</span>
      <span class="badge-captured">📋 Captured: authToken, authUserId</span>
    </div>
    <pre style="margin-left: 1.5rem;"><code>    {
      <span style="color:#34D399">"name"</span>: <span style="color:#F8FAFC">"Authenticate User"</span>,
      <span style="color:#34D399">"method"</span>: <span style="color:#F59E0B">"POST"</span>,
      <span style="color:#34D399">"path"</span>: <span style="color:#6EE7B7">"/auth/login"</span>,
      <span style="color:#34D399">"success"</span>: [{
        <span style="color:#34D399">"name"</span>: <span style="color:#F8FAFC">"Valid credentials capture token"</span>,
        <span style="color:#34D399">"body"</span>: { <span style="color:#34D399">"username"</span>: <span style="color:#6EE7B7">"dev_{{$randomInt}}"</span>, <span style="color:#34D399">"password"</span>: <span style="color:#6EE7B7">"secret"</span> },
        <span style="color:#F59E0B">"capture"</span>: { <span style="color:#34D399">"authToken"</span>: <span style="color:#6EE7B7">"accessToken"</span>, <span style="color:#34D399">"authUserId"</span>: <span style="color:#6EE7B7">"userId"</span> },
        <span style="color:#34D399">"expect"</span>: { <span style="color:#34D399">"status"</span>: <span style="color:#F59E0B">200</span> }
      }]
    },</code></pre>
    <div class="codelens-row" style="margin-left: 1.5rem;">
      <span class="codelens-action">▶ Run Endpoint (GET /users/{id})</span>
      <span class="badge-pass">✓ PASS (200 • 19ms)</span>
    </div>
    <pre style="margin-left: 1.5rem;"><code>    {
      <span style="color:#34D399">"name"</span>: <span style="color:#F8FAFC">"Get User Profile"</span>,
      <span style="color:#34D399">"method"</span>: <span style="color:#34D399">"GET"</span>,
      <span style="color:#34D399">"path"</span>: <span style="color:#6EE7B7">"/users/{id}"</span>,
      <span style="color:#34D399">"headers"</span>: { <span style="color:#34D399">"Authorization"</span>: <span style="color:#FCD34D">"Bearer {{authToken}}"</span> },
      <span style="color:#34D399">"success"</span>: [{
        <span style="color:#34D399">"name"</span>: <span style="color:#F8FAFC">"Fetch authorized user by captured ID"</span>,
        <span style="color:#34D399">"params"</span>: { <span style="color:#34D399">"id"</span>: <span style="color:#FCD34D">"{{authUserId}}"</span> },
        <span style="color:#34D399">"expect"</span>: { <span style="color:#34D399">"status"</span>: <span style="color:#F59E0B">200</span>, <span style="color:#34D399">"maxDurationMs"</span>: <span style="color:#F59E0B">250</span> }
      }]
    }
  ]
}</code></pre>
  </div>
</div>

---

## How RouteCase Works in 4 Steps

```
 ┌───────────────┐      ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
 │  1. Define    │ ───> │  2. Execute   │ ───> │  3. Assert    │ ───> │  4. Chain     │
 │ Create .rcase │      │ Click inline  │      │ Status, body, │      │ Inject tokens │
 │ JSON suite    │      │ CodeLens cell │      │ headers & SLA │      │ downstream    │
 └───────────────┘      └───────────────┘      └───────────────┘      └───────────────┘
```

1. **Define Your Routes:** Structure your endpoints, URL templates, and expected responses in a single `.rcase` file. Schema validation and autocomplete work out-of-the-box.
2. **Execute In-Editor:** Run entire test files, specific endpoints, or isolated test cases using Jupyter-style CodeLens actions.
3. **Verify Responses:** Assert HTTP status codes, substring presence, deep JSON equality, headers, and latency thresholds.
4. **Chain Variables:** Capture values from successful responses (like auth tokens or generated IDs) to reuse in subsequent requests automatically.

---

## Feature Comparison

<div v-pre class="rc-comparison-wrapper">
  <table class="rc-comparison-table">
    <thead>
      <tr>
        <th>Capability</th>
        <th>RouteCase</th>
        <th>Postman</th>
        <th>REST Client</th>
        <th>Thunder Client</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Native VS Code Integration</strong></td>
        <td><span class="rc-status-pill-yes">✅ Native In-Editor</span></td>
        <td><span class="rc-status-pill-no">❌ External App</span></td>
        <td><span class="rc-status-pill-yes">✅ In-Editor</span></td>
        <td><span class="rc-status-pill-yes">✅ In-Editor</span></td>
      </tr>
      <tr>
        <td><strong>Declarative JSON Schema</strong></td>
        <td><span class="rc-status-pill-yes">✅ Yes</span> <code class="rc-code-pill">.rcase</code></td>
        <td><span class="rc-status-pill-no">❌ Proprietary JSON</span></td>
        <td><span class="rc-status-pill-no">❌ Raw .http Text</span></td>
        <td><span class="rc-status-pill-no">❌ Proprietary</span></td>
      </tr>
      <tr>
        <td><strong>Jupyter-Style Inline CodeLens</strong></td>
        <td><span class="rc-status-pill-yes">✅ Floating Cells</span></td>
        <td><span class="rc-status-pill-no">❌ None</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Basic Link</span></td>
        <td><span class="rc-status-pill-no">❌ Separate GUI</span></td>
      </tr>
      <tr>
        <td><strong>Response Variable Chaining</strong></td>
        <td><span class="rc-status-pill-yes">✅ Built-in</span> <code class="rc-code-pill">capture</code></td>
        <td><span class="rc-status-pill-partial">⚠️ Requires JS Scripts</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Complex Regex</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Manual GUI</span></td>
      </tr>
      <tr>
        <td><strong>Built-in Dynamic Generators</strong></td>
        <td><span class="rc-status-pill-yes">✅ Built-in</span> <code class="rc-code-pill">{{$uuid}}</code> <code class="rc-code-pill">{{$timestamp}}</code> <code class="rc-code-pill">{{$randomEmail}}</code></td>
        <td><span class="rc-status-pill-yes">✅ Dynamic Mocking</span></td>
        <td><span class="rc-status-pill-no">❌ Limited</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Partial</span></td>
      </tr>
      <tr>
        <td><strong>Environment Variables (.env)</strong></td>
        <td><span class="rc-status-pill-yes">✅ Supported</span> <code class="rc-code-pill">.rcase.env</code> <code class="rc-code-pill">.json</code></td>
        <td><span class="rc-status-pill-partial">⚠️ Cloud Workspaces</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Settings-based</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Environment Tabs</span></td>
      </tr>
      <tr>
        <td><strong>Instant Copy as cURL</strong></td>
        <td><span class="rc-status-pill-yes">✅ Right-Click</span> <code class="rc-code-pill">cURL</code></td>
        <td><span class="rc-status-pill-yes">✅ Supported</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Manual</span></td>
        <td><span class="rc-status-pill-yes">✅ Supported</span></td>
      </tr>
      <tr>
        <td><strong>OpenAPI / Swagger Importer</strong></td>
        <td><span class="rc-status-pill-yes">✅ Native Zero-Dep</span> <code class="rc-code-pill">OpenAPI 3.x</code></td>
        <td><span class="rc-status-pill-partial">⚠️ Cloud Importer</span></td>
        <td><span class="rc-status-pill-no">❌ Plugin Required</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Paid Tier</span></td>
      </tr>
      <tr>
        <td><strong>Zero Cloud / No Forced Login</strong></td>
        <td><span class="rc-status-pill-yes">✅ 100% Offline & Free</span></td>
        <td><span class="rc-status-pill-no">❌ Forced Cloud Account</span></td>
        <td><span class="rc-status-pill-yes">✅ Offline</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Paid Features</span></td>
      </tr>
      <tr>
        <td><strong>Automatic Secret Redaction</strong></td>
        <td><span class="rc-status-pill-yes">✅ Built-in</span> <code class="rc-code-pill">[REDACTED]</code></td>
        <td><span class="rc-status-pill-no">❌ Manual Masking</span></td>
        <td><span class="rc-status-pill-no">❌ Plaintext in Logs</span></td>
        <td><span class="rc-status-pill-partial">⚠️ Basic</span></td>
      </tr>
    </tbody>
  </table>
</div>

---

## Frequently Asked Questions

### What file extensions does RouteCase support?
RouteCase uses `.rcase` as its primary extension, and also supports `.routecase` and `*.rcase.json`. All formats are automatically mapped to the RouteCase language grammar and JSON schema.

### Does RouteCase require an account or cloud login?
No! RouteCase is 100% local, open-source, and offline. Your endpoints, tokens, requests, and tests never leave your local development machine.

### Can I test APIs without starting a local server?
Yes! RouteCase can test any reachable HTTP or HTTPS endpoint on your local machine, local network, or the public internet. Try our bundled `github-public-api.rcase` example to test live GitHub REST endpoints immediately.

### How do I install RouteCase?
Search for **`RouteCase`** in the Visual Studio Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`), or run `code --install-extension UtkarshKumar.routecase` in your terminal.

---

## Ready to Elevate Your API Testing?

<div style="display: flex; gap: 1rem; justify-content: center; margin: 3rem 0; flex-wrap: wrap;">
  <a href="https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase" style="padding: 12px 24px; background: #10B981; color: #FFFFFF; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">Install Extension Free</a>
  <a href="/docs/introduction/" style="padding: 12px 24px; background: #1E293B; color: #F8FAFC; font-weight: 600; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.1);">Read Documentation →</a>
</div>
