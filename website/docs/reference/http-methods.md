# HTTP Methods & Body Serialization

RouteCase supports all primary HTTP methods and handles request payload serialization automatically.

---

## Method Matrix

| Method | Body Supported | Typical Use Case | Automatic Headers |
| :---: | :---: | :--- | :--- |
| **`GET`** | ❌ No | Fetching resources and reading query parameters | None |
| **`POST`** | ✅ Yes | Creating entities, authentication, RPC actions | `Content-Type: application/json`, `Content-Length` |
| **`PUT`** | ✅ Yes | Complete entity replacement | `Content-Type: application/json`, `Content-Length` |
| **`PATCH`** | ✅ Yes | Partial entity modification | `Content-Type: application/json`, `Content-Length` |
| **`DELETE`** | ✅ Yes | Deleting resources, batch deletion | `Content-Length` (if body provided) |
| **`HEAD`** | ❌ No | Checking header presence, status codes, CORS | None |
| **`OPTIONS`** | ❌ No | Validating CORS preflight and allowed methods | None |

---

## Body Serialization Rules

When you provide a `body` in a test case:

### 1. JSON Objects & Arrays
If `body` is a JavaScript/JSON object or array:
- RouteCase serializes it with `JSON.stringify(testCase.body)`.
- If no `Content-Type` header is explicitly provided, RouteCase automatically injects:
  ```http
  Content-Type: application/json
  ```
- RouteCase calculates the exact byte count using `Buffer.byteLength()` and injects:
  ```http
  Content-Length: <bytes>
  ```

### 2. Raw String Payloads
If `body` is provided as a raw string:
- RouteCase sends the string directly without alteration.
- Useful for sending GraphQL queries, raw XML, YAML, or URL-encoded form data (`application/x-www-form-urlencoded`).
- You must manually declare the corresponding `Content-Type` header.

```json
{
  "name": "Send GraphQL Query",
  "method": "POST",
  "path": "/graphql",
  "headers": {
    "Content-Type": "application/json"
  },
  "success": [
    {
      "name": "Query active users",
      "body": "{\"query\": \"{ users(active: true) { id name } }\"}",
      "expect": { "status": 200 }
    }
  ]
}
```
