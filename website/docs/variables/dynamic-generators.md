# Dynamic Built-in Generators

Testing entity creation endpoints (`POST /users`, `POST /orders`) repeatedly causes `409 Conflict: User already exists` when fields require unique values.

RouteCase provides built-in dynamic generators prefixed with `$` that evaluate dynamically on every test run.

---

## Generator Reference

| Generator Tag | Description | Example Output | Best Used For |
| :--- | :--- | :--- | :--- |
| **`{{$uuid}}`** | Standard UUID v4 string | `f47ac10b-58cc-4372-a567-0e02b2c3d479` | Primary keys, idempotency keys, transaction IDs |
| **`{{$timestamp}}`** | Current epoch timestamp in milliseconds | `1729781963847` | Cache busting, sequential sorting, unique suffixes |
| **`{{$isoDate}}`** | Current ISO-8601 UTC timestamp | `2026-10-24T16:00:00.000Z` | `createdAt`, `updatedAt`, audit log timestamps |
| **`{{$randomEmail}}`** | Unique email with current epoch timestamp | `user_1729781963@routecase.test` | User registration without email collision |
| **`{{$randomName}}`** | Realistic random full name | `Alice Johnson`, `David Chen` | Contact details, display names |
| **`{{$randomInt}}`** | Random integer between 1000 and 9999 | `4821` | Random port numbers, SKUs, quantity values |

---

## Practical Example: User Registration

```json
{
  "name": "Register New Customer",
  "method": "POST",
  "path": "/api/v1/customers",
  "headers": {
    "Content-Type": "application/json"
  },
  "success": [
    {
      "name": "Create unique customer record",
      "body": {
        "id": "{{$uuid}}",
        "name": "{{$randomName}}",
        "email": "{{$randomEmail}}",
        "skuCode": "SKU-{{$randomInt}}",
        "registeredAt": "{{$isoDate}}",
        "epoch": "{{$timestamp}}"
      },
      "expect": {
        "status": 201,
        "bodyContains": "@routecase.test"
      }
    }
  ]
}
```

Every time you click **`▶ Run Case`**, a completely fresh set of values is generated, allowing you to run continuous regression tests without manual database cleanup.
