# Endpoints & Test Cases

RouteCase models API testing around **Endpoints** and **Cases**, reflecting how developers design backend routes.

---

## 1. Endpoints (`EndpointDefinition`)

An endpoint represents a single route registered on your API server (for instance, `GET /api/v1/products/{id}`).

```json
{
  "name": "Fetch Product by ID",
  "method": "GET",
  "path": "/api/v1/products/{id}",
  "headers": {
    "Accept": "application/json"
  },
  "success": [ /* cases */ ],
  "errors": [ /* cases */ ]
}
```

### Supported HTTP Methods
RouteCase strictly validates methods against standard HTTP verbs:
- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `HEAD`
- `OPTIONS`

---

## 2. Test Cases (`TestCase`)

Instead of writing one file per request or duplicating route metadata, each endpoint contains two logical arrays of test cases:

### A. The `success` Array
Scenarios where the endpoint is expected to succeed (typically returning `2xx` HTTP status codes).

```json
"success": [
  {
    "name": "Valid standard user",
    "params": { "id": "user_101" },
    "expect": { "status": 200 }
  },
  {
    "name": "Admin user profile with full permissions",
    "params": { "id": "user_admin" },
    "expect": {
      "status": 200,
      "bodyContains": "ROLE_ADMIN"
    }
  }
]
```

### B. The `errors` Array
Scenarios designed to test validation, authentication barriers, and failure handling (`4xx` or `5xx` status codes).

```json
"errors": [
  {
    "name": "Missing entity returns 404",
    "params": { "id": "nonexistent_9999" },
    "expect": { "status": 404 }
  },
  {
    "name": "Malformed ID string returns 400",
    "params": { "id": "!@#$%^" },
    "expect": { "status": 400 }
  }
]
```

---

## Independent Test Expansion

When you click **`▶ Run All Cases`** on a file with 2 endpoints:
- Endpoint 1 has 1 success case and 3 error cases.
- Endpoint 2 has 2 success cases and 1 error case.

RouteCase expands these into **7 independent HTTP requests**. If Case #2 fails, subsequent cases continue running, providing a complete diagnostic overview of your API health.
