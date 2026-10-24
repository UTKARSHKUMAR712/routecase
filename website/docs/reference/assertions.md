# Assertions Engine Reference

Every RouteCase test case defines an `expect` block. The assertions engine evaluates response status, body contents, headers, and duration thresholds.

---

## 1. `status` (Required)

Validates the numeric HTTP status code returned by the server.

- **Type:** `integer` (between `100` and `599`)
- **Required:** Yes

```json
"expect": {
  "status": 200
}
```

### Evaluation Behavior
- **Pass:** `actualStatus === expect.status` (e.g. 200 === 200, 404 === 404).
- **Fail:** `actualStatus !== expect.status` (reports: `Expected status 200, got 500`).

---

## 2. `bodyContains` (Optional)

Checks whether a specified substring exists anywhere within the response body.

- **Type:** `string`
- **Required:** No

```json
"expect": {
  "status": 200,
  "bodyContains": "accessToken"
}
```

### Evaluation Behavior
- Works against both raw text and serialized JSON response strings.
- **Pass:** Response text includes the substring.
- **Fail:** Substring not found (reports: `Expected response body to contain "accessToken"`).

---

## 3. `bodyEquals` (Optional)

Performs deep structured JSON or exact string equality comparison against the response body.

- **Type:** Any JSON value (`object`, `array`, `string`, `number`, `boolean`, `null`)
- **Required:** No

```json
"expect": {
  "status": 404,
  "bodyEquals": {
    "error": "NotFound",
    "message": "User with ID usr_999 does not exist",
    "code": 404
  }
}
```

### Evaluation Behavior
- Automatically parses string bodies as JSON if valid JSON is detected.
- Recursively compares all keys, nested objects, and array elements.
- Ignores key ordering in JSON objects.
- **Fail:** Any nested field or element differs (reports exact mismatch details).

---

## 4. `headers` (Optional)

Validates that expected HTTP headers are present in the server's response.

- **Type:** `Record<string, string>`
- **Required:** No

```json
"expect": {
  "status": 200,
  "headers": {
    "content-type": "application/json",
    "x-ratelimit-remaining": "99"
  }
}
```

### Evaluation Behavior
- Header key comparison is **case-insensitive** (e.g. `Content-Type` matches `content-type`).
- Header value comparison checks whether the actual response header includes the expected substring.

---

## 5. `maxDurationMs` (Optional)

Enforces strict latency and performance SLAs on API endpoints.

- **Type:** `integer` (minimum: `1`)
- **Required:** No

```json
"expect": {
  "status": 200,
  "maxDurationMs": 250
}
```

### Evaluation Behavior
- Measures round-trip execution duration from initial socket connection to response body completion.
- **Pass:** `durationMs <= maxDurationMs` (e.g. `45ms <= 250ms`).
- **Fail:** `durationMs > maxDurationMs` (reports: `Request took 320ms, exceeding maximum duration of 250ms`).
