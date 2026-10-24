<p align="center">
  <img src="resources/icon.png" width="160" height="160" alt="RouteCase Logo" />
  <br/>
  <strong>API TESTING MADE SIMPLE</strong>
</p>

# RouteCase — API Route & Endpoint Tester for VS Code

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/UtkarshKumar.routecase)](https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/UtkarshKumar.routecase)](https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase)
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

## 🌟 The All-Included Master Example (`all-features.rcase`)

Here is a complete, production-grade `.rcase` definition demonstrating **every single capability** of RouteCase in one file:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Comprehensive RouteCase Showcase Suite (All Features)",
  "baseUrl": "https://api.example.com",
  "headers": {
    "Accept": "application/json",
    "User-Agent": "RouteCase-TestRunner/0.1.0"
  },
  "tests": [
    {
      "name": "Create new product item",
      "method": "POST",
      "path": "/api/v1/products",
      "headers": {
        "Content-Type": "application/json",
        "x-api-key": "test-api-key-9988"
      },
      "success": [
        {
          "name": "Standard product creation",
          "description": "Verifies 201 Created with generated title, headers, and strict latency SLA",
          "body": {
            "title": "Ergonomic Mechanical Keyboard",
            "price": 149.99,
            "currency": "USD",
            "category": "Electronics",
            "inStock": true,
            "tags": ["hardware", "keyboard", "usb-c"]
          },
          "expect": {
            "status": 201,
            "bodyContains": "Ergonomic Mechanical Keyboard",
            "headers": {
              "content-type": "application/json"
            },
            "maxDurationMs": 450
          }
        }
      ],
      "errors": [
        {
          "name": "Validation error on negative price",
          "description": "Ensure negative price triggers a 422 Unprocessable response",
          "body": {
            "title": "Invalid Price Item",
            "price": -25.0,
            "category": "Electronics"
          },
          "expect": {
            "status": 422,
            "bodyContains": "Price must be greater than zero"
          }
        },
        {
          "name": "Missing required title",
          "description": "Payload without title field returns 400 Bad Request",
          "body": {
            "price": 29.99
          },
          "expect": {
            "status": 400,
            "bodyContains": "title is required"
          }
        }
      ]
    },
    {
      "name": "Search & filter catalog with query parameters",
      "method": "GET",
      "path": "/api/v1/products/search?category={category}&minPrice={minPrice}&inStock={inStock}",
      "success": [
        {
          "name": "Search electronics in stock",
          "description": "Safe query parameter substitution with spaces, special characters, and pagination",
          "params": {
            "category": "Computers & Laptops",
            "minPrice": 50,
            "inStock": true
          },
          "query": {
            "page": 1,
            "limit": 25,
            "sort": "price_asc"
          },
          "expect": {
            "status": 200,
            "bodyContains": "results",
            "maxDurationMs": 600
          }
        }
      ],
      "errors": [
        {
          "name": "Invalid pagination page number",
          "params": {
            "category": "Electronics",
            "minPrice": 0,
            "inStock": true
          },
          "query": {
            "page": -1,
            "limit": 10
          },
          "expect": {
            "status": 400,
            "bodyContains": "page must be positive integer"
          }
        }
      ]
    },
    {
      "name": "Fetch product by path ID template",
      "method": "GET",
      "path": "/api/v1/products/{id}",
      "success": [
        {
          "name": "Fetch existing product (id: prod_101)",
          "params": {
            "id": "prod_101"
          },
          "expect": {
            "status": 200,
            "bodyContains": "prod_101",
            "maxDurationMs": 250
          }
        }
      ],
      "errors": [
        {
          "name": "Product not found",
          "params": {
            "id": "prod_nonexistent_9999"
          },
          "expect": {
            "status": 404,
            "bodyEquals": {
              "error": "NotFound",
              "message": "Product with ID prod_nonexistent_9999 does not exist"
            }
          }
        }
      ]
    },
    {
      "name": "Partial update product stock & price",
      "method": "PATCH",
      "path": "/api/v1/products/{id}",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer sample-jwt-access-token"
      },
      "success": [
        {
          "name": "Discount price adjustment",
          "params": {
            "id": "prod_101"
          },
          "body": {
            "price": 129.99,
            "onSale": true
          },
          "expect": {
            "status": 200,
            "bodyContains": "129.99"
          }
        }
      ],
      "errors": [
        {
          "name": "Unauthorized update attempt without valid token",
          "params": {
            "id": "prod_101"
          },
          "headers": {
            "Authorization": "Bearer expired-or-invalid-token"
          },
          "body": {
            "price": 10.0
          },
          "expect": {
            "status": 401,
            "bodyContains": "Unauthorized"
          }
        }
      ]
    },
    {
      "name": "Delete obsolete product (Admin only)",
      "method": "DELETE",
      "path": "/api/v1/products/{id}",
      "headers": {
        "Authorization": "Bearer admin-super-secret-token"
      },
      "success": [
        {
          "name": "Delete discontinued product",
          "params": {
            "id": "prod_legacy_404"
          },
          "expect": {
            "status": 204
          }
        }
      ],
      "errors": [
        {
          "name": "Forbidden for non-admin accounts",
          "params": {
            "id": "prod_legacy_404"
          },
          "headers": {
            "Authorization": "Bearer standard-customer-token"
          },
          "expect": {
            "status": 403,
            "bodyContains": "Forbidden"
          }
        }
      ]
    }
  ]
}
```

### What This Example Showcases:
| Feature | Implementation in Example |
| :--- | :--- |
| **All HTTP Methods** | Demonstrates `GET`, `POST`, `PATCH`, and `DELETE`. |
| **Path Placeholders** | `/api/v1/products/{id}` dynamically replaced from `params: { "id": "prod_101" }`. |
| **Query Parameters** | Combined template (`?category={category}`) + `query: { "page": 1, "limit": 25 }`. |
| **Nested JSON Bodies** | Complex payload with objects, numbers, booleans, and arrays. |
| **Status Assertions** | Validates `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `422 Unprocessable`. |
| **Substring Assertions** | `bodyContains`: checks for key strings in response body. |
| **Deep JSON Equality** | `bodyEquals`: compares structured JSON objects for exact match. |
| **Header Assertions** | `headers`: validates expected response headers like `content-type`. |
| **Latency SLA Benchmark** | `maxDurationMs`: fails if the endpoint takes longer than specified milliseconds (e.g. 250ms). |
| **Automatic Secret Redaction** | Headers like `Authorization` and `x-api-key` are automatically redacted with `[REDACTED]` in reports. |

---

## 📚 Bundled Examples Library

RouteCase includes 7 real-world test suites ready to explore:

| Example File | Scenario & Purpose |
| :--- | :--- |
| **`all-features.rcase`** | **Master Showcase:** Every feature, HTTP method, parameter type, and assertion. |
| **`github-public-api.rcase`** | **Live Public API:** Tests live `api.github.com` endpoints (run instantly without localhost!). |
| **`ecommerce-crud.rcase`** | **Store API:** Products catalog, cart line items, orders checkout, and tracking. |
| **`auth-and-security.rcase`** | **Authentication & RBAC:** Login JWTs, Bearer auth, expired tokens, and 401/403 security checks. |
| **`superheroes.rcase`** | **Quick Start:** Classic path-parameter expansion with success and error cases. |
| **`users-api.rcase`** | **RESTful Users:** User CRUD, query string filtering, pagination, and data validation. |
| **`error-handling.rcase`** | **Edge Cases & Diagnostics:** Simulated server errors, timeouts, and edge cases. |

> **Tip:** Press `Ctrl+Shift+P` (or `Cmd+Shift+P`) > run **`RouteCase: Create Example Test File`** to pick and create any of these templates directly inside your project!

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
