# RouteCase — API Route & Endpoint Tester for VS Code

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**RouteCase** is a modern, lightweight Visual Studio Code extension designed for developers who build and test HTTP APIs. 

Instead of manually sending repetitive HTTP requests or maintaining bloated Postman collections, RouteCase lets you **define an API endpoint once** and run multiple input cases against it using different parameters, bodies, and assertions.

---

## Key Features

- **Declarative `.rcase` Format:** Define your base URL, endpoint path template, and test cases in a single structured JSON file.
- **Inline Cell Actions (Jupyter-Style):** Click `▶ Run All Cases`, `▶ Run Endpoint`, or `▶ Run Case` directly inside your `.rcase` file above any test case, with live inline status badges (`✓ PASS 200 • 35ms`).
- **Independent Case Expansion:** One endpoint with 1 success case and 3 error cases automatically produces 4 independent test runs.
- **Safe Path Parameter Substitution:** Safely expands path placeholders like `/api/info/{name}` with full URL encoding.
- **Built-in Assertions:** Validate expected HTTP status codes, `bodyContains` text matches, `bodyEquals` deep JSON equality, response headers, and duration thresholds.
- **Native VS Code Tree View:** Real-time test explorer in the Activity Bar showing PASS, FAIL, ERROR, and RUNNING states with execution durations.
- **Rich Results Panel:** Interactive Webview panel displaying full request details, redacted headers, response previews, and assertion comparisons.
- **Zero Configuration & Security-First:** No accounts, no cloud sync, no external backend, and automatic redaction of secrets (`Authorization`, `Cookie`, `x-api-key`).

---

## Interactive Jupyter-Style Inline Execution

Whenever you open a `.rcase` file, RouteCase renders clickable **CodeLens actions directly inside the editor**:

```json
// [▶ Run All Cases]  [📊 Results Dashboard]
{
  "baseUrl": "http://localhost:3000",
  "tests": [
    // [▶ Run Endpoint (Get superhero by name)]
    {
      "name": "Get superhero by name",
      "method": "GET",
      "path": "/api/info/{name}",
      "success": [
        // [▶ Run Case]  [✓ PASS (200 • 45ms)]
        {
          "name": "Find Batman",
          "params": { "name": "Batman" },
          "expect": {
            "status": 200,
            "bodyContains": "Batman"
          }
        }
      ],
      "errors": [
        // [▶ Run Case]
        {
          "name": "Unknown superhero",
          "params": { "name": "UnknownHero123" },
          "expect": { "status": 404 }
        }
      ]
    }
  ]
}
```

- Click **`▶ Run All Cases`** at the top to execute the full suite.
- Click **`▶ Run Endpoint (...)`** to execute all success & error cases for that route.
- Click **`▶ Run Case`** above any individual scenario to run only that test case in isolation (just like a Jupyter notebook cell!).
- Click the live **`✓ PASS`** or **`✗ FAIL`** badge next to the test case to instantly reveal its diagnostic headers, body preview, and assertion breakdown.

---

## Quick Start

### 1. Create a `.rcase` Test File

Create a file named `superheroes.rcase` (or run command `RouteCase: Create Example Test File`):

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Superhero API Test Suite",
  "baseUrl": "http://localhost:3000",
  "tests": [
    {
      "name": "Get superhero by name",
      "method": "GET",
      "path": "/api/info/{name}",
      "success": [
        {
          "name": "Find Batman",
          "params": {
            "name": "Batman"
          },
          "expect": {
            "status": 200,
            "bodyContains": "Batman"
          }
        }
      ],
      "errors": [
        {
          "name": "Unknown superhero",
          "params": {
            "name": "UnknownHero123"
          },
          "expect": {
            "status": 404
          }
        },
        {
          "name": "Invalid name rat",
          "params": {
            "name": "rat"
          },
          "expect": {
            "status": 404
          }
        },
        {
          "name": "Invalid name king",
          "params": {
            "name": "king"
          },
          "expect": {
            "status": 404
          }
        }
      ]
    }
  ]
}
```

### 2. Run the Tests

- Click **`▶ Run All Cases`** directly at the top of the file.
- Or click **`▶ Run Case`** above any specific test scenario.
- Or click the **Play** icon in the editor title bar.
- Or press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run `RouteCase: Run Tests in Current File`.
- Or click the **RouteCase** icon in the VS Code Activity Bar on the left.

---

## How It Works

### Path Template Substitution
Placeholders wrapped in curly braces (`{key}`) are matched against the test case's `params` object:

* **Template:** `/api/users/{userId}/posts/{postId}`
* **Params:** `{ "userId": "admin", "postId": 42 }`
* **Resolved Request:** `GET http://localhost:3000/api/users/admin/posts/42`

Each parameter value is safely URL-encoded. If a placeholder is missing in a test case, RouteCase stops before sending network requests and flags an informative validation error.

### Query Parameters
You can also specify query parameters using the optional `query` dictionary:

```json
{
  "name": "Filter active users",
  "query": {
    "status": "active",
    "limit": 10
  },
  "expect": {
    "status": 200
  }
}
```

### POST / PUT / PATCH Requests with Body
For state-changing requests, specify the `body` field (as JSON or string):

```json
{
  "name": "Create new superhero",
  "method": "POST",
  "path": "/api/heroes",
  "success": [
    {
      "name": "Add Flash",
      "body": {
        "name": "The Flash",
        "alterEgo": "Barry Allen"
      },
      "expect": {
        "status": 201,
        "bodyContains": "The Flash"
      }
    }
  ]
}
```

---

## Assertions Reference

Every test case defines an `expect` block:

| Property | Type | Description |
| :--- | :--- | :--- |
| `status` | `number` | **Required.** Expected HTTP status code (e.g. `200`, `201`, `400`, `404`, `500`). |
| `bodyContains` | `string` | Optional substring that must be present in the response body. |
| `bodyEquals` | `any` | Optional exact string or deep JSON object comparison against response body. |
| `headers` | `object` | Key-value pairs of expected HTTP headers in the response. |
| `maxDurationMs` | `number` | Maximum allowed request duration in milliseconds (fails if slower). |

---

## Commands

| Command | Title | Description |
| :--- | :--- | :--- |
| `routecase.runCurrentFile` | **RouteCase: Run Tests in Current File** | Executes all test cases in the active `.rcase` file. |
| `routecase.runSingleCase` | **RouteCase: Run Test Case** | Executes a single individual test case (called via inline CodeLens). |
| `routecase.runEndpoint` | **RouteCase: Run Endpoint Cases** | Executes all cases under a specific endpoint route. |
| `routecase.runAll` | **RouteCase: Run All Tests** | Discovers and runs all `.rcase` and `.routecase` files across the workspace. |
| `routecase.stopRun` | **RouteCase: Stop Test Run** | Immediately cancels an ongoing test run. |
| `routecase.validateCurrentFile` | **RouteCase: Validate Current File** | Validates the current file syntax against the RouteCase JSON schema. |
| `routecase.createExample` | **RouteCase: Create Example Test File** | Generates a starter `api.rcase` superhero test file in the workspace root. |
| `routecase.openResultsPanel` | **RouteCase: Open Results Panel** | Opens the interactive Webview results panel. |

---

## Extension Settings

RouteCase contributes the following configuration options:

* `routecase.requestTimeout` *(default: `10000`)*: Timeout in milliseconds for each individual HTTP request.
* `routecase.maxResponseSize` *(default: `5242880`)*: Maximum response size in bytes before aborting (default 5MB).
* `routecase.followRedirects` *(default: `false`)*: Whether to follow HTTP redirects (disabled by default for safety).

---

## Security & Privacy

- **No Telemetry / No Tracking:** RouteCase does not collect analytics or make external calls to third-party tracking services.
- **Credential Redaction:** Sensitive request headers (including `Authorization`, `Cookie`, `x-api-key`, `token`) are automatically redacted with `[REDACTED]` in the UI, tree views, and logs.
- **Safe Rendering:** All response bodies and URLs rendered inside the VS Code Webview panel are sanitized and escaped against HTML injection (XSS) with strict Content Security Policies.

---

## License

[MIT License](https://opensource.org/licenses/MIT) © 2026 RouteCase Contributors
