# Authoring Your First Test Suite

This guide walks through creating, structuring, and running an end-to-end API test suite using RouteCase.

---

## Anatomy of a `.rcase` File

A RouteCase test file is a JSON document with three main components:

1. **Root Configuration:** Metadata, base URL, and common request headers.
2. **Endpoint Definitions:** API routes grouped by path template and HTTP verb.
3. **Test Cases:** Partitioned into `success` and `errors` scenarios.

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "User Management Service Tests",
  "baseUrl": "http://localhost:3000",
  "headers": {
    "Accept": "application/json"
  },
  "tests": [
    {
      "name": "Get User Details",
      "method": "GET",
      "path": "/api/users/{id}",
      "success": [
        {
          "name": "Fetch Admin User",
          "params": { "id": "1001" },
          "expect": {
            "status": 200,
            "bodyContains": "admin"
          }
        }
      ],
      "errors": [
        {
          "name": "User Not Found",
          "params": { "id": "9999" },
          "expect": {
            "status": 404
          }
        }
      ]
    }
  ]
}
```

---

## Using Schema Validation and Autocomplete

By including the `$schema` property pointing to `schemas/rcase.schema.json` (or our GitHub raw URL), VS Code provides:

- Real-time linting and red squiggly underlines for syntax errors.
- Hover tooltips detailing each property's data type and meaning.
- Autocomplete for HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`).
- Property completion for assertion blocks (`status`, `bodyContains`, `bodyEquals`, `headers`, `maxDurationMs`).

---

## Ways to Run Your Tests

RouteCase gives you multiple ways to execute tests depending on your current workflow:

### 1. In-Editor CodeLens (Fastest)
Floating buttons appear directly in the editor above your code:
- **`▶ Run All Cases`**: Runs every test case in the document in top-to-bottom sequence.
- **`▶ Run Endpoint`**: Runs only the test cases belonging to that specific route.
- **`▶ Run Case`**: Runs an isolated single scenario (great for debugging a failing edge case).

### 2. Editor Title Bar Action
Click the **Play (▶)** icon in the top right editor tab bar when viewing any `.rcase` file.

### 3. Command Palette
Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) and run:
```text
RouteCase: Run Tests in Current File
```

### 4. RouteCase Test Explorer Tree
Open the RouteCase icon in the Activity Bar. You can run all workspace test suites or rerun individual endpoints from the tree.

---

## Understanding Execution Results

When a test finishes, RouteCase displays:

- **Inline Status Badges:** Displayed right next to the test case:
  - `✓ PASS (200 • 42ms)`
  - `✗ FAIL (Expected 200, got 500)`
  - `⚠ ERROR (Connection refused at 127.0.0.1:3000)`
- **Results Panel:** Click any badge to open the side-by-side interactive results webview showing request headers (with secrets safely redacted), serialized body, actual response headers, formatted body preview, and each assertion's status.
