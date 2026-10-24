# Troubleshooting Guide

Find answers and diagnostic steps for common issues encountered during API test execution.

---

## 1. Connection Refused (`ECONNREFUSED 127.0.0.1:3000`)

### Symptom
Test case status displays `⚠ ERROR: connect ECONNREFUSED 127.0.0.1:3000`.

### Causes & Fixes
- **Server Not Running:** Verify that your local API server is active in another terminal tab or background task (`npm run dev` or `python main.py`).
- **Port Mismatch:** Check that the port number in your `.rcase` `baseUrl` matches the listening port of your backend.
- **`localhost` vs `127.0.0.1`:** On some Node or Windows environments, IPv6 `localhost` resolves to `::1` while Express listens on IPv4 `127.0.0.1`. Try changing `baseUrl` to `http://127.0.0.1:3000`.

---

## 2. Request Timeout (`ERROR: Request timed out after 10000ms`)

### Symptom
Test case execution halts and reports timeout after 10 seconds.

### Causes & Fixes
- **Backend Deadlock:** Your endpoint might be hung waiting for a database transaction or missing a `res.send()` / `res.json()` call in Express.
- **Heavy Endpoint:** If your endpoint performs slow operations (PDF rendering, AI inference, large database migrations), increase the timeout in `.vscode/settings.json`:
  ```json
  "routecase.requestTimeout": 30000
  ```

---

## 3. Chained Variable Shows `{{myVar}}` in Raw Form

### Symptom
The outgoing URL or header contains the literal text `{{myVar}}` instead of the extracted token.

### Causes & Fixes
- **Running Case in Isolation:** If you click `▶ Run Case` on Step #2 without running Step #1 first, `myVar` has not been captured yet in the session store. Click **`▶ Run All Cases`** to execute sequentially from the beginning.
- **Dot-Notation Path Mismatch:** Check the exact JSON structure returned by Step #1. If the server returns `{ "data": { "token": "..." } }`, writing `"capture": { "myVar": "token" }` will fail. You must write `"capture": { "myVar": "data.token" }`.

---

## 4. Query Parameter Separator Encoded as `%3F`

### Symptom
Server returns `404 Cannot GET /api/search%3Fquery=...`.

### Causes & Fixes
- Update to RouteCase `v0.1.1` or higher. Earlier pre-release versions had a URL constructor bug that was completely resolved in commit `8f1a700`.

---

## 5. Secret Token Showing as `[REDACTED]`

### Symptom
In the Results Webview panel, your `Authorization` or `x-api-key` header displays `[REDACTED]`.

### Explanation
This is an **intentional security feature**. RouteCase automatically sanitizes credentials before displaying them in UI panels or tree views to prevent accidental exposure during screen sharing, screenshots, or screen recordings. The actual un-redacted token is sent over the wire to your API server.
