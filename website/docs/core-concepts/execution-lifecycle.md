# Execution & Request Lifecycle

When you trigger a test in RouteCase, each test case passes through a well-defined 9-step execution pipeline.

---

## The Request Execution Pipeline

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Load Environment (.rcase.env, .rcase.env.json, settings) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 2. Merge Environment & Captured Variables into Context      │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 3. Substitute Variables in params, query, body & headers     │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 4. Generate Built-in Dynamic Values ({{$uuid}}, {{$isoDate}})│
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 5. Build WHATWG URL & Merge Headers (File < Endpoint < Case)│
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 6. Execute HTTP/HTTPS Socket (Node.js http/https client)    │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 7. Evaluate Assertions (Status, bodyContains, bodyEquals)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 8. Extract & Store 'capture' Variables for Downstream Cases │
 └──────────────────────────────┬──────────────────────────────┘
                                │
 ┌──────────────────────────────▼──────────────────────────────┐
 │ 9. Emit Results to CodeLens Badge, Tree View & Results Panel│
 └─────────────────────────────────────────────────────────────┘
```

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
