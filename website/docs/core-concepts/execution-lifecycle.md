# Execution & Request Lifecycle

When you trigger a test in RouteCase, each test case passes through a well-defined 9-step execution pipeline.

---

## The Request Execution Pipeline

<div v-pre class="rc-pipeline-stepper">
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">01</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Load Workspace Environment</span>
    <span class="rc-pipeline-sub">Scans for .rcase.env, .rcase.env.json & workspace settings</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">02</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Merge Context & Chained Variables</span>
    <span class="rc-pipeline-sub">Combines environment entries with runtime capture store</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">03</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Substitute Template Placeholders</span>
    <span class="rc-pipeline-sub">Expands &#123;&#123;VAR&#125;&#125; in params, query, body & headers</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">04</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Generate Dynamic Test Data</span>
    <span class="rc-pipeline-sub">Computes fresh values for &#123;&#123;$uuid&#125;&#125;, &#123;&#123;$timestamp&#125;&#125;, &#123;&#123;$randomEmail&#125;&#125;</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">05</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Construct WHATWG URL & Merge Headers</span>
    <span class="rc-pipeline-sub">Encodes path & query parameters safely; cascades headers (File &lt; Endpoint &lt; Case)</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">06</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Dispatch HTTP/HTTPS Socket</span>
    <span class="rc-pipeline-sub">Transmits payload via native Node.js client with timeout & size safety guards</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">07</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Evaluate Multi-Level Assertions</span>
    <span class="rc-pipeline-sub">Validates status code, bodyContains, bodyEquals, headers, and maxDurationMs SLA</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">08</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Extract & Store Captured Tokens</span>
    <span class="rc-pipeline-sub">Extracts JSON properties via dot notation into shared session context</span>
  </div>
</div>
<div class="rc-pipeline-step-item">
  <span class="rc-pipeline-num">09</span>
  <div class="rc-pipeline-info">
    <span class="rc-pipeline-name">Emit Synchronous Results</span>
    <span class="rc-pipeline-sub">Updates inline CodeLens badges, Activity Bar tree view, and Webview results panel</span>
  </div>
</div>
</div>

---

## Detailed Step Walkthrough

### Step 1 & 2: Environment & Context Loading
The engine scans for `.rcase.env` and `.rcase.env.json` in the active workspace root, merging them with any VS Code `routecase.env` settings. The internal `captureStore` carries forward any variables extracted from earlier test cases within the same suite run.

### Step 3 & 4: Variable Resolution & Dynamic Generators
Template placeholders (`{{VAR}}`) are resolved. Any built-in generator tags (`{{$uuid}}`, `{{$randomEmail}}`, etc.) are computed with fresh values.

### Step 5: URL Construction & Header Merging
The target URL is assembled. Request headers are merged hierarchically:
1. Root-level headers (e.g. `User-Agent`, `Accept`)
2. Endpoint-level headers (e.g. `Content-Type`)
3. Case-level headers (e.g. `Authorization: Bearer {{token}}`)

### Step 6: HTTP Request Execution
Node's native client executes the request. The timeout timer begins (configurable via `routecase.requestTimeout`, default: 10,000ms). If the response exceeds `routecase.maxResponseSize` (default: 5MB), execution is aborted for safety.

### Step 7: Assertion Evaluation
The response status code, headers, body, and round-trip duration are validated against the `expect` block.

### Step 8: Variable Capture
If the test case succeeded and defines a `capture` block, dot-notation expressions extract values from the JSON body and store them in the suite's shared session store.

### Step 9: UI Updates
Status badges (`✓ PASS` or `✗ FAIL`), Activity Bar tree nodes, and Webview results are updated simultaneously.
