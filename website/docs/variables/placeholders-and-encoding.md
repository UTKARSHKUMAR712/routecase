# URL Path & Query Placeholders & Encoding

RouteCase provides a safe, standards-compliant URL construction engine that prevents common percent-encoding bugs while handling spaces, special characters, and Unicode.

---

## Path Placeholders

Path placeholders use single curly braces `{placeholder}`:

```json
{
  "name": "Get User Details",
  "method": "GET",
  "path": "/api/users/{userId}/posts/{postId}",
  "success": [
    {
      "name": "Fetch post for admin",
      "params": {
        "userId": "user_42",
        "postId": 108
      },
      "expect": { "status": 200 }
    }
  ]
}
```

### Path Substitution Rules
1. Every `{key}` in `path` must have a matching entry in `testCase.params`.
2. Parameter values are safely encoded using standard percent-encoding (`encodeURIComponent`).
3. If a `{key}` is missing from `params`, RouteCase flags a validation error immediately before sending any network request.

---

## Query Parameters

Query parameters can be defined in two ways:

### Approach A: Directly in `path` with Placeholders
```json
"path": "/api/search?q={query}&category={category}"
```
With params:
```json
"params": {
  "query": "Mechanical Keyboard",
  "category": "Computers & Electronics"
}
```
**Resolved Request:**
```text
/api/search?q=Mechanical%20Keyboard&category=Computers%20%26%20Electronics
```

### Approach B: Using the `query` Dictionary
```json
"path": "/api/search",
"query": {
  "q": "Mechanical Keyboard",
  "category": "Computers & Electronics",
  "page": 1,
  "limit": 25
}
```

Both approaches can be combined. Query parameters are appended cleanly without duplicate question marks (`?`).

---

## The `%3F` Encoding Bug (And How RouteCase Prevents It)

Many custom HTTP testing tools incorrectly pass entire path strings (including `?` and query strings) into Node's `new URL(path, base)`. This causes the WHATWG URL standard to treat `?` as a literal character in the pathname, percent-encoding it to `%3F`:

```text
❌ Buggy URL:    http://localhost:3000/api/search%3Fquery=batman
   Result:       404 Cannot GET /api/search%3Fquery=batman
```

RouteCase separates pathnames from query strings at the first `?`, assigning the route to `url.pathname` and parameter values to `url.searchParams`:

```text
✅ RouteCase:   http://localhost:3000/api/search?query=batman
   Result:      200 OK (Reaches Express route app.get('/api/search'))
```
