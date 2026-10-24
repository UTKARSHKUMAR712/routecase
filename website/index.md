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

<div v-pre class="rc-workflow-wrapper">
<div class="rc-workflow-grid">
<div class="rc-workflow-card">
  <div class="rc-workflow-header">
    <span class="rc-workflow-step">STEP 01</span>
    <div class="rc-workflow-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
    </div>
  </div>
  <h3 class="rc-workflow-title">Define Contract</h3>
  <p class="rc-workflow-desc">Structure endpoints, path templates, and mock inputs in a clean <code>.rcase</code> JSON suite with instant schema autocomplete.</p>
  <div class="rc-workflow-code">
    <div class="rc-workflow-tag">suite.rcase</div>
    <div class="rc-workflow-snippet"><span class="tok-k">"path"</span>: <span class="tok-s">"/users/{id}"</span></div>
  </div>
</div>
<div class="rc-workflow-card">
  <div class="rc-workflow-header">
    <span class="rc-workflow-step">STEP 02</span>
    <div class="rc-workflow-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    </div>
  </div>
  <h3 class="rc-workflow-title">Trigger In-Editor</h3>
  <p class="rc-workflow-desc">Run full suites, individual routes, or isolated test cases using floating Jupyter-style CodeLens cells with one click.</p>
  <div class="rc-workflow-code">
    <div class="rc-workflow-tag">CodeLens Cell</div>
    <div class="rc-workflow-snippet"><span class="tok-action">▶ Run Endpoint</span> <span class="tok-time">⚡ 28ms</span></div>
  </div>
</div>
<div class="rc-workflow-card">
  <div class="rc-workflow-header">
    <span class="rc-workflow-step">STEP 03</span>
    <div class="rc-workflow-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
    </div>
  </div>
  <h3 class="rc-workflow-title">Verify Assertions</h3>
  <p class="rc-workflow-desc">Assert HTTP status codes, structured body JSON equality, substring containment, and strict latency SLA thresholds.</p>
  <div class="rc-workflow-code">
    <div class="rc-workflow-tag">Contract Guard</div>
    <div class="rc-workflow-snippet"><span class="tok-pass">✓ status: 200</span> <span class="tok-pass">✓ &lt; 250ms</span></div>
  </div>
</div>
<div class="rc-workflow-card">
  <div class="rc-workflow-header">
    <span class="rc-workflow-step">STEP 04</span>
    <div class="rc-workflow-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
    </div>
  </div>
  <h3 class="rc-workflow-title">Cascade Variables</h3>
  <p class="rc-workflow-desc">Capture auth tokens and IDs from successful responses to inject them into downstream test cases automatically.</p>
  <div class="rc-workflow-code">
    <div class="rc-workflow-tag">Variable Chaining</div>
    <div class="rc-workflow-snippet"><span class="tok-k">capture</span>: <span class="tok-s">{ "token": "jwt" }</span></div>
  </div>
</div>
</div>
</div>

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

<div v-pre class="rc-faq-container">
<details class="rc-faq-item" open>
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">What file extensions does RouteCase support?</span>
    <span class="rc-faq-badge">Syntax & Schema</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p>RouteCase uses <code>.rcase</code> as its primary extension, and also fully recognizes <code>.routecase</code> and <code>*.rcase.json</code> files. When opened in VS Code, all files automatically activate the RouteCase language grammar, bundled JSON schema validation, hover tooltips, and real-time syntax checking.</p>
  </div>
</details>
<details class="rc-faq-item">
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">Does RouteCase require a cloud account, login, or telemetry?</span>
    <span class="rc-faq-badge">Privacy & Offline</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p><strong>Zero accounts, zero cloud dependencies, zero tracking.</strong> RouteCase is 100% offline and runs strictly on your local machine. Your API credentials, payloads, tokens, and test suites never leave your development environment. Sensitive headers like <code>Authorization</code>, <code>apiKey</code>, and session cookies are automatically masked with <code>[REDACTED]</code> in all log outputs.</p>
  </div>
</details>
<details class="rc-faq-item">
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">Can I test local development servers without starting a proxy?</span>
    <span class="rc-faq-badge">Local Testing</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p>Yes! RouteCase connects directly to any reachable endpoint—including <code>http://localhost:3000</code>, <code>http://127.0.0.1:8080</code>, local Docker containers, private VPN environments, and public internet APIs. No separate background daemon or browser companion is required.</p>
  </div>
</details>
<details class="rc-faq-item">
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">How does variable chaining and token capture work?</span>
    <span class="rc-faq-badge">Workflow Automation</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p>In any test case, provide a <code>capture</code> map to extract response JSON properties using dot notation (e.g. <code>"authToken": "data.accessToken"</code>). RouteCase persists these variables in memory during the execution run, enabling subsequent requests to reference them via template syntax: <code>"Authorization": "Bearer {{authToken}}"</code>.</p>
  </div>
</details>
<details class="rc-faq-item">
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">Can I import my existing OpenAPI 3.0 or Swagger 2.0 specifications?</span>
    <span class="rc-faq-badge">Migration</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p>Yes. RouteCase includes a native, zero-dependency OpenAPI importer. Press <code>Ctrl+Shift+P</code> (or <code>Cmd+Shift+P</code> on macOS), run <strong><code>RouteCase: Import from OpenAPI / Swagger</code></strong>, select your JSON spec, and RouteCase instantly transforms your operations, paths, parameters, and schemas into executable <code>.rcase</code> suites.</p>
  </div>
</details>
<details class="rc-faq-item">
  <summary class="rc-faq-summary">
    <span class="rc-faq-question">How do I install RouteCase in Visual Studio Code?</span>
    <span class="rc-faq-badge">Installation</span>
    <span class="rc-faq-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
  </summary>
  <div class="rc-faq-content">
    <p>Open VS Code, press <code>Ctrl+Shift+X</code> (or <code>Cmd+Shift+X</code>), search for <strong><code>RouteCase</code></strong>, and click <strong>Install</strong>. Alternatively, install it directly from your command line with:</p>
    <p><code>code --install-extension UtkarshKumar.routecase</code></p>
  </div>
</details>
</div>

---

## Ready to Elevate Your API Testing?

<div style="display: flex; gap: 1rem; justify-content: center; margin: 3rem 0; flex-wrap: wrap;">
  <a href="https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase" style="padding: 12px 24px; background: #10B981; color: #FFFFFF; font-weight: 700; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">Install Extension Free</a>
  <a href="/docs/introduction/" style="padding: 12px 24px; background: #1E293B; color: #F8FAFC; font-weight: 600; border-radius: 8px; text-decoration: none; border: 1px solid rgba(255,255,255,0.1);">Read Documentation →</a>
</div>
