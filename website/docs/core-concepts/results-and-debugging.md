# Results & Debugging

RouteCase provides clear, actionable diagnostics whenever a test passes or fails.

---

## Test Status Meanings

| Status | Icon | Meaning | Common Cause |
| :--- | :---: | :--- | :--- |
| **`PASS`** | ✓ | All assertions succeeded within latency limits. | Endpoint is behaving as specified. |
| **`FAIL`** | ✗ | Request executed, but one or more assertions failed. | Status code mismatch (expected 200, got 500) or missing substring in body. |
| **`ERROR`** | ⚠ | Network, socket, or parsing error prevented completion. | Server not running (ECONNREFUSED), timeout exceeded, or invalid URL. |
| **`CANCELLED`**| ⊘ | User aborted the test run midway. | Remaining test cases marked cancelled. |

---

## The Interactive Results Panel

Clicking any inline status badge or running **`RouteCase: Open Results Panel`** reveals the interactive diagnostics dashboard:

### 1. Request Inspection
- Complete resolved URL (e.g. `http://localhost:4000/api/users/usr_42?active=true`).
- Merged request headers with all secrets (`Authorization`, `Cookie`, `x-api-key`) automatically masked with `[REDACTED]`.
- Serialized JSON or raw text request body.

### 2. Response Inspection
- Received HTTP status code and status text (`200 OK`, `404 Not Found`).
- Server response headers (`Content-Type`, `Date`, custom headers).
- Formatted body preview with syntax highlighting and collapsible JSON nodes.

### 3. Assertion Breakdown
Every condition in your `expect` block is detailed with:
- Expected value vs Actual value.
- Exact failure reason if mismatched.
- Latency measurement (`42ms` against `maxDurationMs: 250`).

### 4. Captured Variables
If the case captured tokens, a dedicated badge lists the stored variables and their extracted values (e.g. `authToken = eyJhbGci...`).

---

## Debugging Workflows

### Debugging with "Copy as cURL"
When an assertion fails unexpectedly:
1. Right-click the test case in your `.rcase` file.
2. Select **`RouteCase: Copy as cURL`**.
3. Paste the command into your terminal:
   ```bash
   curl -X POST "http://localhost:4000/api/users" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     -d '{"name":"Alice","email":"alice@example.com"}'
   ```
4. Verify server behavior directly and compare headers.
