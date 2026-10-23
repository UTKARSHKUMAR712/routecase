# RouteCase Examples & Recipes

This guide contains complete `.rcase` examples covering common backend scenarios across Express, Node.js, Fastify, Flask, Django, and Spring Boot.

---

## 1. The Reference MVP Example (Path Parameter Expansion)

This matches the core specification: one endpoint with multiple parameters expanded into separate HTTP requests.

```json
{
  "$schema": "https://raw.githubusercontent.com/routecase/routecase/main/schemas/rcase.schema.json",
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

---

## 2. CRUD Operations & State-Changing Requests (POST, PUT, DELETE)

Testing user creation with JSON request body, validation errors, duplicate checks, and pagination queries:

```json
{
  "$schema": "https://raw.githubusercontent.com/routecase/routecase/main/schemas/rcase.schema.json",
  "name": "User Management CRUD API",
  "baseUrl": "https://api.myapp.com",
  "headers": {
    "Accept": "application/json"
  },
  "tests": [
    {
      "name": "Create new user account",
      "method": "POST",
      "path": "/api/v1/users",
      "headers": {
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Register valid developer user",
          "body": {
            "username": "batman_dev",
            "email": "bruce@wayne.enterprise",
            "role": "developer"
          },
          "expect": {
            "status": 201,
            "bodyContains": "batman_dev",
            "headers": {
              "content-type": "application/json"
            },
            "maxDurationMs": 2000
          }
        }
      ],
      "errors": [
        {
          "name": "Reject duplicate email registration",
          "body": {
            "username": "imposter",
            "email": "bruce@wayne.enterprise"
          },
          "expect": {
            "status": 409,
            "bodyContains": "Email already in use"
          }
        },
        {
          "name": "Reject missing required username field",
          "body": {
            "email": "anonymous@wayne.enterprise"
          },
          "expect": {
            "status": 422,
            "bodyContains": "username is required"
          }
        }
      ]
    },
    {
      "name": "Query and filter active users",
      "method": "GET",
      "path": "/api/v1/users",
      "success": [
        {
          "name": "Fetch page 1 of active developers",
          "query": {
            "role": "developer",
            "status": "active",
            "limit": 10,
            "page": 1
          },
          "expect": {
            "status": 200,
            "bodyContains": "batman_dev",
            "maxDurationMs": 1500
          }
        }
      ],
      "errors": [
        {
          "name": "Reject invalid pagination limit exceeding maximum",
          "query": {
            "limit": 5000
          },
          "expect": {
            "status": 400,
            "bodyContains": "Limit must not exceed 100"
          }
        }
      ]
    },
    {
      "name": "Delete user by ID",
      "method": "DELETE",
      "path": "/api/v1/users/{userId}",
      "headers": {
        "Authorization": "Bearer my-secret-token"
      },
      "success": [
        {
          "name": "Successfully remove test account",
          "params": {
            "userId": "9999"
          },
          "expect": {
            "status": 204
          }
        }
      ],
      "errors": [
        {
          "name": "Prevent unauthorized deletion without valid bearer token",
          "params": {
            "userId": "1"
          },
          "headers": {
            "Authorization": "Bearer invalid-expired-token"
          },
          "expect": {
            "status": 401
          }
        }
      ]
    }
  ]
}
```

---

## 3. Strict Header & Authorization Validation

Testing role-based access control, API keys, and custom headers:

```json
{
  "$schema": "https://raw.githubusercontent.com/routecase/routecase/main/schemas/rcase.schema.json",
  "name": "Role-Based Access Control Checks",
  "baseUrl": "http://localhost:8080",
  "tests": [
    {
      "name": "Access protected admin statistics",
      "method": "GET",
      "path": "/api/v2/admin/stats",
      "success": [
        {
          "name": "Superadmin authorized access",
          "headers": {
            "X-Admin-Key": "valid-superadmin-secret-key"
          },
          "expect": {
            "status": 200,
            "bodyContains": "system_uptime"
          }
        }
      ],
      "errors": [
        {
          "name": "Missing admin key header produces 401",
          "expect": {
            "status": 401
          }
        },
        {
          "name": "Forbidden insufficient permissions produces 403",
          "headers": {
            "X-Admin-Key": "read-only-guest-key"
          },
          "expect": {
            "status": 403,
            "bodyContains": "Access denied"
          }
        }
      ]
    }
  ]
}
```
