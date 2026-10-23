# RouteCase JSON Schema Specification

RouteCase uses a JSON schema to validate `.rcase` and `.routecase` test files. The schema provides full IntelliSense, autocomplete, and inline documentation in Visual Studio Code.

---

## Root Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | No | Path or URL referencing `rcase.schema.json`. |
| `name` | `string` | No | A descriptive label for the test suite. |
| `baseUrl` | `string` | **Yes** | Base URL of the API server (e.g. `http://localhost:3000` or `https://api.myapp.com`). Must be an absolute URL starting with `http://` or `https://`. |
| `headers` | `object` | No | Global HTTP headers sent with every request across all endpoints in this file (e.g. `{"Accept": "application/json"}`). |
| `tests` | `array` | **Yes** | Array of endpoint definitions to test. |

---

## Endpoint Definition (`EndpointDefinition`)

Each item in the `tests` array represents an API endpoint:

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Human-readable name for this endpoint (e.g. `"Get user by ID"`). |
| `method` | `string` | **Yes** | HTTP method. Must be one of: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. |
| `path` | `string` | **Yes** | Path template. Can contain placeholders enclosed in curly braces, e.g. `/api/users/{id}/details/{subId}`. |
| `headers` | `object` | No | Endpoint-level HTTP headers (merged over global headers). |
| `success` | `array` | No | Array of test cases expected to return a successful response. |
| `errors` | `array` | No | Array of test cases expected to return an error response (e.g. 400, 404, 500). |

---

## Test Case Definition (`TestCase`)

Each object in `success` or `errors` defines a single execution scenario:

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Name of this test case (e.g. `"Find Batman"`). |
| `description` | `string` | No | Detailed notes about what this case tests. |
| `params` | `object` | No | Key-value pairs providing values for path placeholders (e.g. `{"name": "Batman"}`). Values can be strings, numbers, or booleans and are URL-encoded automatically. |
| `query` | `object` | No | Key-value pairs appended to the URL as query string parameters (e.g. `{"sort": "desc", "page": 1}`). |
| `headers` | `object` | No | Case-specific HTTP headers (merged over endpoint and global headers). |
| `body` | `any` | No | Request body for `POST`, `PUT`, or `PATCH`. If provided as a JSON object, RouteCase automatically serializes it and sets `Content-Type: application/json`. |
| `expect` | `object` | **Yes** | Expected assertions for this test case. |

---

## Expectations (`TestCaseExpectation`)

The `expect` block defines what assertions must pass for the test case to be marked as **PASS**:

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | `number` | **Yes** | Expected integer HTTP status code between `100` and `599`. |
| `bodyContains` | `string` | No | Substring that must be present in the response body. |
| `bodyEquals` | `any` | No | Expected exact response. If an object is supplied, performs deep JSON equality. |
| `headers` | `object` | No | Key-value pairs of expected HTTP headers in the response (case-insensitive keys). |
| `maxDurationMs` | `number` | No | Maximum allowed response time in milliseconds. If the response takes longer, the test fails. |
