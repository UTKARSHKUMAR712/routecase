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

**RouteCase** is a modern, lightweight VS Code extension for testing HTTP APIs — directly from your editor. No browser, no external app, no accounts.

Define your API endpoints once in a `.rcase` file, run every input case with one click, and see instant PASS / FAIL results right inside VS Code — just like Jupyter Notebook cells for your API routes.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **📄 Declarative `.rcase` Format** | Define base URL, endpoints, and all test cases in structured JSON. IntelliSense and schema validation included. |
| **▶ Jupyter-Style Inline Execution** | Click `▶ Run All Cases`, `▶ Run Endpoint`, or `▶ Run Case` directly above each test — live `✓ PASS` / `✗ FAIL` badges update in-place. |
| **🔁 All HTTP Methods** | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` — fully supported. |
| **🔗 Response Token Chaining** | Capture values from one response (`accessToken`, `userId`) and automatically inject them into all subsequent requests. |
| **🌍 Environment Variables** | Use `{{VAR_NAME}}` placeholders resolved from `.rcase.env`, `.rcase.env.json`, or VS Code settings. Switch between local / staging / production without touching test files. |
| **⚡ Dynamic Built-in Variables** | `{{$uuid}}`, `{{$timestamp}}`, `{{$randomEmail}}`, `{{$randomName}}`, `{{$randomInt}}`, `{{$isoDate}}` — fresh values generated on every run. |
| **📋 Copy as cURL** | Right-click any test case → copy a ready-to-run cURL command to your clipboard. |
| **📥 OpenAPI / Swagger Import** | Import any OpenAPI 3.x or Swagger 2.x JSON spec and auto-generate a full `.rcase` test suite. |
| **🔍 Full Assertions Engine** | `status`, `bodyContains`, `bodyEquals` (deep JSON), response `headers`, `maxDurationMs` latency SLA. |
| **🌲 Activity Bar Explorer** | Real-time test tree showing PASS, FAIL, ERROR, RUNNING states with elapsed durations. |
| **🔒 Security-First** | Auto-redacts `Authorization`, `Cookie`, `x-api-key` in all logs and results panels. No telemetry, no cloud sync. |

---

## 🚀 The Complete Master Example (All Features in One File)

This single `.rcase` file demonstrates **every RouteCase capability** — environment variables, dynamic values, token chaining, all HTTP methods, and all assertion types:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "RouteCase — Complete Feature Showcase v0.2.0",
  "baseUrl": "{{API_BASE_URL}}",
  "headers": {
    "Accept": "application/json",
    "x-api-key": "{{API_KEY}}",
    "User-Agent": "RouteCase/0.2.0"
  },
  "tests": [

    {
      "name": "1. Health Check (GET — no auth)",
      "method": "GET",
      "path": "/health",
      "success": [
        {
          "name": "Server is healthy",
          "expect": {
            "status": 200,
            "bodyContains": "ok",
            "maxDurationMs": 300
          }
        }
      ]
    },

    {
      "name": "2. Login & Capture Token (POST + capture)",
      "method": "POST",
      "path": "/auth/login",
      "success": [
        {
          "name": "Login and store accessToken for later requests",
          "description": "The 'capture' block extracts values from the response body. {{authToken}} and {{authUserId}} are now available to ALL subsequent test cases in this file.",
          "body": {
            "username": "tester_{{$randomInt}}",
            "password": "my-secure-password"
          },
          "capture": {
            "authToken": "accessToken",
            "authUserId": "userId"
          },
          "expect": {
            "status": 200,
            "bodyContains": "accessToken",
            "headers": {
              "content-type": "application/json"
            },
            "maxDurationMs": 500
          }
        }
      ],
      "errors": [
        {
          "name": "Wrong password returns 401",
          "body": {
            "username": "admin",
            "password": "wrong-password"
          },
          "expect": {
            "status": 401,
            "bodyContains": "Invalid credentials"
          }
        },
        {
          "name": "Missing username returns 400",
          "body": {
            "password": "some-password"
          },
          "expect": {
            "status": 400
          }
        }
      ]
    },

    {
      "name": "3. Create User (POST + dynamic variables + capture)",
      "method": "POST",
      "path": "/users",
      "headers": {
        "Authorization": "Bearer {{authToken}}",
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Register a unique user every run",
          "description": "{{$randomEmail}} generates a new email each run — no more 'duplicate email' 409 Conflict errors. {{$uuid}} creates a collision-free ID. {{$isoDate}} stamps the creation time.",
          "body": {
            "id": "{{$uuid}}",
            "name": "{{$randomName}}",
            "email": "{{$randomEmail}}",
            "role": "developer",
            "createdAt": "{{$isoDate}}"
          },
          "capture": {
            "createdUserId": "id"
          },
          "expect": {
            "status": 201,
            "bodyContains": "id",
            "headers": {
              "content-type": "application/json"
            },
            "maxDurationMs": 600
          }
        }
      ],
      "errors": [
        {
          "name": "Duplicate email returns 409",
          "body": {
            "email": "existing@example.com",
            "name": "Duplicate User"
          },
          "expect": {
            "status": 409,
            "bodyContains": "already exists"
          }
        },
        {
          "name": "Missing required email returns 422",
          "body": {
            "name": "No Email User"
          },
          "expect": {
            "status": 422,
            "bodyContains": "email is required"
          }
        }
      ]
    },

    {
      "name": "4. Get User by ID (GET + path param + chained variable)",
      "method": "GET",
      "path": "/users/{id}",
      "headers": {
        "Authorization": "Bearer {{authToken}}"
      },
      "success": [
        {
          "name": "Fetch the user we just created using {{createdUserId}}",
          "description": "{{createdUserId}} was captured from the POST /users response above. No copy-paste required.",
          "params": {
            "id": "{{createdUserId}}"
          },
          "expect": {
            "status": 200,
            "bodyContains": "email",
            "maxDurationMs": 250
          }
        }
      ],
      "errors": [
        {
          "name": "Non-existent user returns 404 with exact JSON body",
          "params": {
            "id": "usr_does_not_exist_99999"
          },
          "expect": {
            "status": 404,
            "bodyEquals": {
              "error": "Not Found",
              "message": "User not found"
            }
          }
        }
      ]
    },

    {
      "name": "5. List Users with Pagination (GET + query params)",
      "method": "GET",
      "path": "/users",
      "headers": {
        "Authorization": "Bearer {{authToken}}"
      },
      "success": [
        {
          "name": "Fetch first page of users",
          "query": {
            "page": 1,
            "limit": 10,
            "sort": "createdAt",
            "order": "desc"
          },
          "expect": {
            "status": 200,
            "bodyContains": "users",
            "maxDurationMs": 400
          }
        },
        {
          "name": "Search users by role filter",
          "query": {
            "role": "developer",
            "page": 1,
            "limit": 5
          },
          "expect": {
            "status": 200
          }
        }
      ],
      "errors": [
        {
          "name": "Negative page number returns 400",
          "query": {
            "page": -1,
            "limit": 10
          },
          "expect": {
            "status": 400,
            "bodyContains": "page must be"
          }
        }
      ]
    },

    {
      "name": "6. Full Replace User (PUT)",
      "method": "PUT",
      "path": "/users/{id}",
      "headers": {
        "Authorization": "Bearer {{authToken}}",
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Replace user profile completely",
          "params": {
            "id": "{{createdUserId}}"
          },
          "body": {
            "name": "{{$randomName}}",
            "email": "{{$randomEmail}}",
            "role": "admin",
            "updatedAt": "{{$isoDate}}"
          },
          "expect": {
            "status": 200,
            "bodyContains": "admin"
          }
        }
      ],
      "errors": [
        {
          "name": "Unauthorized PUT without token",
          "params": {
            "id": "{{createdUserId}}"
          },
          "headers": {
            "Authorization": "Bearer expired-or-invalid-token"
          },
          "body": {
            "name": "Hacker",
            "email": "hacker@evil.com"
          },
          "expect": {
            "status": 401,
            "bodyContains": "Unauthorized"
          }
        }
      ]
    },

    {
      "name": "7. Partial Update User (PATCH)",
      "method": "PATCH",
      "path": "/users/{id}",
      "headers": {
        "Authorization": "Bearer {{authToken}}",
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Update only the user's role",
          "params": {
            "id": "{{createdUserId}}"
          },
          "body": {
            "role": "moderator"
          },
          "expect": {
            "status": 200,
            "bodyContains": "moderator"
          }
        }
      ],
      "errors": [
        {
          "name": "PATCH on non-existent user returns 404",
          "params": {
            "id": "usr_ghost_0000"
          },
          "body": {
            "role": "admin"
          },
          "expect": {
            "status": 404
          }
        }
      ]
    },

    {
      "name": "8. Create Product (POST + UUID body field)",
      "method": "POST",
      "path": "/products",
      "headers": {
        "Authorization": "Bearer {{authToken}}",
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Create product with dynamic UUID and random price suffix",
          "body": {
            "productId": "{{$uuid}}",
            "sku": "SKU-{{$randomInt}}",
            "name": "Premium Gadget {{$randomInt}}",
            "price": 49.99,
            "currency": "USD",
            "inStock": true,
            "tags": ["electronics", "new-arrival"],
            "createdAt": "{{$timestamp}}"
          },
          "capture": {
            "createdProductId": "productId"
          },
          "expect": {
            "status": 201,
            "bodyContains": "productId",
            "maxDurationMs": 500
          }
        }
      ],
      "errors": [
        {
          "name": "Negative price returns 422",
          "body": {
            "productId": "{{$uuid}}",
            "name": "Bad Product",
            "price": -10.00
          },
          "expect": {
            "status": 422,
            "bodyContains": "Price must be"
          }
        }
      ]
    },

    {
      "name": "9. Delete User (DELETE — uses chained ID)",
      "method": "DELETE",
      "path": "/users/{id}",
      "headers": {
        "Authorization": "Bearer {{authToken}}"
      },
      "success": [
        {
          "name": "Delete the user we created and updated above",
          "description": "{{createdUserId}} flows all the way from Step 3 (POST /users capture) through to this final cleanup step.",
          "params": {
            "id": "{{createdUserId}}"
          },
          "expect": {
            "status": 200,
            "bodyContains": "deleted"
          }
        }
      ],
      "errors": [
        {
          "name": "Forbidden: non-admin cannot delete another user",
          "params": {
            "id": "{{createdUserId}}"
          },
          "headers": {
            "Authorization": "Bearer standard-user-token"
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

### Feature Coverage Map

| Step | HTTP Method | Feature Demonstrated |
| :---: | :---: | :--- |
| 1 | `GET` | Status assertion, `maxDurationMs` latency SLA |
| 2 | `POST` | **Token Capture** (`capture` → `{{authToken}}`), body, header assertions |
| 3 | `POST` | **Dynamic Variables** (`{{$uuid}}`, `{{$randomEmail}}`, `{{$randomName}}`, `{{$isoDate}}`), cascade capture |
| 4 | `GET` | **Chained path param** (`{{createdUserId}}`), `bodyEquals` deep JSON comparison |
| 5 | `GET` | **Query parameters** (pagination, filter, sort), multiple success cases |
| 6 | `PUT` | Full resource replacement, 401 unauthorized error case |
| 7 | `PATCH` | Partial update, 404 error case |
| 8 | `POST` | `{{$uuid}}` in body field, `{{$timestamp}}` epoch, nested arrays |
| 9 | `DELETE` | Chained variable flows all the way from step 3, 403 forbidden error |

---

## ⚡ Interactive Jupyter-Style Inline Execution

Open any `.rcase` file and click the floating actions that appear above each test:

```json
// ▶ Run All Cases   📊 Results Dashboard
{
  "baseUrl": "{{API_BASE_URL}}",
  "tests": [
    // ▶ Run Endpoint (Login & Capture Token)
    {
      "name": "Login & Capture Token",
      "method": "POST",
      "path": "/auth/login",
      "success": [
        // ▶ Run Case   ✓ PASS (200 • 42ms)   📋 Captured: authToken, authUserId
        {
          "name": "Login and store access token",
          "body": { "username": "admin", "password": "secret" },
          "capture": { "authToken": "accessToken" },
          "expect": { "status": 200 }
        }
      ]
    }
  ]
}
```

- **`▶ Run All Cases`** — runs the entire file in sequence, chaining captured variables between steps.
- **`▶ Run Endpoint`** — runs all success + error cases for a single route.
- **`▶ Run Case`** — runs exactly one case in isolation (like a Jupyter cell).
- **`✓ PASS`** / **`✗ FAIL`** badges — click to open the full diagnostic panel.
- **`📋 Captured: authToken`** — shows which variables were captured for downstream use.

---

## 🌍 Environment Variables (`.rcase.env`)

Create a `.rcase.env` file in your project root (add to `.gitignore`!):

```env
API_BASE_URL=http://localhost:4000
API_KEY=my-dev-secret-key-123
ADMIN_USER_ID=usr_admin_001
DB_SEED_TOKEN=seed-token-for-tests
```

Or use JSON format (`.rcase.env.json`):

```json
{
  "API_BASE_URL": "https://staging-api.myapp.com",
  "API_KEY": "staging-key-abc",
  "ADMIN_USER_ID": "usr_staging_admin"
}
```

Then use `{{VAR_NAME}}` anywhere in your `.rcase` file:

```json
{
  "baseUrl": "{{API_BASE_URL}}",
  "headers": {
    "x-api-key": "{{API_KEY}}"
  },
  "tests": [
    {
      "name": "Get Admin Profile",
      "method": "GET",
      "path": "/users/{{ADMIN_USER_ID}}",
      "success": [
        { "name": "Fetch admin", "expect": { "status": 200 } }
      ]
    }
  ]
}
```

> **Tip:** Keep a `.rcase.env.local`, `.rcase.env.staging`, and `.rcase.env.prod` file. Copy the right one to `.rcase.env` to switch environments instantly.

---

## ⚡ Dynamic Built-in Variables

No configuration needed — use these anywhere in `params`, `query`, `body`, or `headers`:

| Variable | Example Output | Best For |
| :--- | :--- | :--- |
| `{{$uuid}}` | `a3f5c8d2-1b4e-4a7f-9c2d-8e1f3a5b7c9d` | Unique IDs, preventing duplicate key conflicts |
| `{{$timestamp}}` | `1729781963847` | Epoch-based ordering, idempotency keys |
| `{{$isoDate}}` | `2026-10-24T16:00:00.000Z` | `createdAt`, `updatedAt` fields |
| `{{$randomEmail}}` | `user_1729781963@routecase.test` | Registration tests without 409 Conflict |
| `{{$randomName}}` | `Alice Johnson` | Name fields, display names |
| `{{$randomInt}}` | `4821` | Random suffixes, test identifiers |

```json
{
  "name": "Register New User",
  "body": {
    "id":        "{{$uuid}}",
    "name":      "{{$randomName}}",
    "email":     "{{$randomEmail}}",
    "tag":       "user-{{$randomInt}}",
    "createdAt": "{{$isoDate}}",
    "sessionId": "{{$timestamp}}"
  },
  "expect": { "status": 201 }
}
```

---

## 🔗 Response Token Chaining

Capture any field from a response body and inject it into all subsequent requests — perfect for auth flows:

```json
{
  "tests": [
    {
      "name": "Step 1: Login",
      "method": "POST",
      "path": "/auth/login",
      "success": [
        {
          "name": "Get access token",
          "body": { "email": "admin@example.com", "password": "secret" },
          "capture": {
            "authToken":  "accessToken",
            "authUserId": "user.id",
            "orgId":      "user.organization.id"
          },
          "expect": { "status": 200 }
        }
      ]
    },
    {
      "name": "Step 2: Get Protected Profile",
      "method": "GET",
      "path": "/users/{{authUserId}}",
      "headers": { "Authorization": "Bearer {{authToken}}" },
      "success": [
        {
          "name": "Access profile using captured token",
          "expect": { "status": 200 }
        }
      ]
    },
    {
      "name": "Step 3: Create Resource in User's Org",
      "method": "POST",
      "path": "/organizations/{{orgId}}/projects",
      "headers": { "Authorization": "Bearer {{authToken}}" },
      "success": [
        {
          "name": "Create project using captured org ID",
          "body": { "name": "My Project", "ownerId": "{{authUserId}}" },
          "capture": { "projectId": "id" },
          "expect": { "status": 201 }
        }
      ]
    }
  ]
}
```

**Dot-notation paths** are supported for nested JSON:
- `"accessToken"` → `body.accessToken`
- `"user.id"` → `body.user.id`
- `"data.auth.token"` → `body.data.auth.token`
- `"items[0].id"` → first item in an array

---

## 📋 Copy as cURL

Right-click anywhere inside a `.rcase` file → **RouteCase: Copy as cURL**:

```bash
curl -X POST "http://localhost:4000/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-api-key: my-secret-key" \
  -d '{"username":"admin","password":"secret"}'
```

The cURL command includes all merged headers (file-level + endpoint-level + case-level) and the serialized request body. Paste it directly into any terminal or share it with teammates.

---

## 📥 OpenAPI / Swagger Import

Press `Ctrl+Shift+P` → **RouteCase: Import OpenAPI / Swagger**:

1. Select a local `openapi.json` or `swagger.json` file — or enter a URL.
2. RouteCase reads all `paths` from the spec.
3. A complete `.rcase` file is generated with:
   - One endpoint per route + HTTP method combination.
   - Starter `success` case (status 200 or first defined success code).
   - Starter `errors` case (status 400 or 422 if defined).
   - `body` pre-filled from `requestBody` examples in the spec.
   - `params` pre-filled from path parameters.
   - `query` pre-filled from query parameters with example values.

> **Note:** YAML specs must be converted to JSON first (e.g. via [json2yaml.com](https://www.json2yaml.com/)).

---

## 📚 Bundled Example Library

Press `Ctrl+Shift+P` → **RouteCase: Create Example Test File** to pick from 9 ready-to-run templates:

| Example | What It Tests |
| :--- | :--- |
| **`all-features.rcase`** | Every HTTP method, path/query params, bodies, and all assertion types |
| **`full-suite.rcase`** | Token chaining, dynamic variables, env vars, all 9 HTTP methods in sequence |
| **`github-public-api.rcase`** | Live `api.github.com` — run instantly, no local server needed |
| **`ecommerce-crud.rcase`** | Product catalog, cart, orders, line items |
| **`auth-and-security.rcase`** | JWT login, Bearer auth, 401 / 403 security checks |
| **`env-demo.rcase`** | `{{API_BASE_URL}}`, `{{API_KEY}}`, `{{$uuid}}`, `{{$isoDate}}` |
| **`superheroes.rcase`** | Classic quick-start path parameter expansion |
| **`users-api.rcase`** | RESTful user CRUD, pagination, validation |
| **`error-handling.rcase`** | 400 / 404 / 500 errors, timeouts, edge cases |

---

## Assertions Reference

Every test case has an `expect` block. All fields except `status` are optional:

```json
"expect": {
  "status": 201,
  "bodyContains": "accessToken",
  "bodyEquals": { "role": "admin", "active": true },
  "headers": {
    "content-type": "application/json",
    "x-request-id": "abc123"
  },
  "maxDurationMs": 500
}
```

| Field | Type | Description |
| :--- | :---: | :--- |
| `status` | `number` | **Required.** Exact expected HTTP status code (e.g. `200`, `201`, `404`). |
| `bodyContains` | `string` | A substring that must appear anywhere in the response body. |
| `bodyEquals` | `any` | Deep equality — the full response body must match this JSON value exactly. |
| `headers` | `object` | Each key-value pair must be present in the response headers. |
| `maxDurationMs` | `number` | The request must complete within this many milliseconds. Fails if slower. |

---

## `.rcase` File Schema Reference

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Suite Name (optional)",
  "baseUrl": "http://localhost:3000",
  "headers": { "Global-Header": "sent with every request" },
  "tests": [
    {
      "name": "Endpoint Name",
      "method": "POST",
      "path": "/api/resource/{id}",
      "headers": { "Endpoint-Header": "sent with all cases in this endpoint" },
      "success": [
        {
          "name": "Case Name",
          "description": "What this case validates (optional)",
          "params":  { "id": "{{createdId}}" },
          "query":   { "filter": "active", "page": 1 },
          "headers": { "Case-Header": "overrides endpoint-level header" },
          "body":    { "field": "{{$randomName}}", "id": "{{$uuid}}" },
          "capture": { "capturedVar": "response.body.path" },
          "expect": {
            "status": 201,
            "bodyContains": "success",
            "bodyEquals": { "ok": true },
            "headers": { "content-type": "application/json" },
            "maxDurationMs": 400
          }
        }
      ],
      "errors": [
        {
          "name": "Missing field returns 422",
          "body": {},
          "expect": { "status": 422 }
        }
      ]
    }
  ]
}
```

---

## Commands Reference

| Command | Shortcut / Trigger | Description |
| :--- | :--- | :--- |
| **Run Tests in Current File** | Editor title bar ▶ / CodeLens | Executes all test cases in the active `.rcase` file. |
| **Run All Tests** | Activity Bar | Discovers and runs all `.rcase` files across the workspace. |
| **Run Endpoint Cases** | CodeLens `▶ Run Endpoint` | Runs all cases under a single endpoint. |
| **Run Test Case** | CodeLens `▶ Run Case` | Runs one individual case in isolation. |
| **Stop Test Run** | Command Palette | Immediately cancels an in-progress test run. |
| **Validate Current File** | Command Palette | Validates the JSON schema of the active `.rcase` file. |
| **Create Example Test File** | Command Palette | Opens a picker to create a bundled example in your workspace. |
| **Copy as cURL** | Right-click inside `.rcase` | Copies the nearest test case as a cURL command to clipboard. |
| **Import OpenAPI / Swagger** | Command Palette | Generates a `.rcase` suite from an OpenAPI / Swagger JSON spec. |
| **Open Results Panel** | Command Palette / Tree View | Opens the interactive Webview results dashboard. |

---

## Extension Settings

| Setting | Default | Description |
| :--- | :---: | :--- |
| `routecase.requestTimeout` | `10000` | Per-request timeout in milliseconds. |
| `routecase.maxResponseSize` | `5242880` | Maximum response size in bytes (5 MB). |
| `routecase.followRedirects` | `false` | Follow HTTP redirects (disabled by default for safety). |
| `routecase.env` | `{}` | Key-value environment variables as an alternative to `.rcase.env`. |

---

## Security & Privacy

- **No Telemetry / No Tracking:** RouteCase makes zero external calls for analytics.
- **Credential Redaction:** `Authorization`, `Cookie`, `x-api-key`, and `token` headers are replaced with `[REDACTED]` in all results panels, tree views, and logs.
- **Safe Rendering:** All content in the Webview results panel is HTML-escaped and protected by a strict Content Security Policy.
- **Local Only:** All test execution is done locally. No data ever leaves your machine.

---

## License

[MIT License](https://opensource.org/licenses/MIT) © 2026 RouteCase Contributors

[GitHub](https://github.com/UTKARSHKUMAR712/routecase) · [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=UtkarshKumar.routecase) · [Report an Issue](https://github.com/UTKARSHKUMAR712/routecase/issues)
