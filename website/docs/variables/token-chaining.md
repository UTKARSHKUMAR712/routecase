# Response Token Chaining (`capture`)

Real-world API testing requires sequential workflows: login to obtain a JWT token, and then pass that token in the `Authorization` header to test protected endpoints.

RouteCase supports this natively with the `capture` block.

---

## The `capture` Block Syntax

Add a `capture` object inside any test case in your `.rcase` file:

```json
"capture": {
  "myToken": "accessToken",
  "currentUserId": "data.user.id",
  "firstProductId": "items[0].id"
}
```

- **Key (e.g. `myToken`):** The variable name you will use downstream as `{{myToken}}`.
- **Value (e.g. `data.user.id`):** A dot-notation expression pointing to the value inside the server's JSON response body.

---

## Full End-to-End Auth Example

```json
{
  "name": "Authenticated Workflow",
  "baseUrl": "https://api.example.com",
  "tests": [
    {
      "name": "1. User Login",
      "method": "POST",
      "path": "/auth/login",
      "success": [
        {
          "name": "Login and capture tokens",
          "body": {
            "username": "developer",
            "password": "Password123!"
          },
          "capture": {
            "jwtToken": "token",
            "activeUserId": "user.id"
          },
          "expect": {
            "status": 200
          }
        }
      ]
    },
    {
      "name": "2. Get Protected Profile",
      "method": "GET",
      "path": "/users/{id}",
      "headers": {
        "Authorization": "Bearer {{jwtToken}}"
      },
      "success": [
        {
          "name": "Fetch profile for captured user ID",
          "params": {
            "id": "{{activeUserId}}"
          },
          "expect": {
            "status": 200
          }
        }
      ]
    }
  ]
}
```

---

## Supported JSON Extraction Expressions

- **Top-Level Field:** `"token"` → extracts `response.body.token`
- **Nested Object Field:** `"user.profile.name"` → extracts `response.body.user.profile.name`
- **Array Indexing:** `"items[0].id"` or `"orders.0.orderNumber"` → extracts the first element's ID
- **Deep Primitive Values:** Numbers, booleans, and strings are coerced to strings for substitution.

::: warning Isolated Execution Note
If you click **`▶ Run Case`** on Case #2 in isolation without running Case #1 first, `{{jwtToken}}` will not exist in the session store. To execute chained workflows, always click **`▶ Run All Cases`** or run Case #1 first.
:::
