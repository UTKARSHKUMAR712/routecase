# .rcase Schema Reference

This page provides the exhaustive specification for the RouteCase test document format (`.rcase` and `.routecase`), validated against `schemas/rcase.schema.json`.

---

## Document Root Structure

```typescript
interface RCaseDocument {
  $schema?: string;
  name?: string;
  baseUrl: string;
  headers?: Record<string, string>;
  tests: EndpointDefinition[];
}
```

### Properties

| Property | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| **`$schema`** | `string` | Optional | URI to RouteCase JSON Schema (enables IntelliSense and validation). |
| **`name`** | `string` | Optional | Human-readable title for the test suite document. |
| **`baseUrl`** | `string` | **Required** | Base protocol, hostname, and optional port (e.g. `http://localhost:3000` or `{{API_BASE_URL}}`). |
| **`headers`** | `object` | Optional | Key-value pairs sent with every request across all endpoints. |
| **`tests`** | `array` | **Required** | Array of `EndpointDefinition` objects to execute. |

---

## Endpoint Definition (`EndpointDefinition`)

```typescript
interface EndpointDefinition {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  path: string;
  headers?: Record<string, string>;
  success?: TestCaseDefinition[];
  errors?: TestCaseDefinition[];
}
```

### Properties

| Property | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| **`name`** | `string` | **Required** | Descriptive name for this API route. |
| **`method`** | `string` | **Required** | HTTP verb: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. |
| **`path`** | `string` | **Required** | Path template. Supports `{param}` placeholders (e.g. `/users/{id}` or `/search?q={query}`). |
| **`headers`** | `object` | Optional | Headers applied to all cases under this endpoint. |
| **`success`** | `array` | Optional | Array of test cases expected to return successful responses. |
| **`errors`** | `array` | Optional | Array of test cases expected to return client/server error responses. |

---

## Test Case Definition (`TestCaseDefinition`)

```typescript
interface TestCaseDefinition {
  name: string;
  description?: string;
  params?: Record<string, string | number | boolean>;
  query?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  body?: unknown;
  capture?: Record<string, string>;
  expect: AssertionExpectation;
}
```

### Properties

| Property | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| **`name`** | `string` | **Required** | Descriptive name for this individual test scenario. |
| **`description`** | `string` | Optional | Additional context explaining what is being validated. |
| **`params`** | `object` | Optional | Key-value substitutions for `{key}` placeholders in `path`. |
| **`query`** | `object` | Optional | Additional query string parameters appended to the URL. |
| **`headers`** | `object` | Optional | Case-level request headers (highest precedence). |
| **`body`** | `any` | Optional | JSON payload (object, array) or raw string sent in request body. |
| **`capture`** | `object` | Optional | Dot-notation extraction mappings (e.g. `"myToken": "accessToken"`). |
| **`expect`** | `object` | **Required** | Assertion assertions block. |

---

## Assertion Expectation (`AssertionExpectation`)

| Property | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| **`status`** | `integer` | **Required** | Expected numeric HTTP status code (e.g. `200`, `201`, `404`). Minimum: `100`, Maximum: `599`. |
| **`bodyContains`** | `string` | Optional | Substring that must be present in the response body text. |
| **`bodyEquals`** | `any` | Optional | Exact string or deep structured JSON equality match. |
| **`headers`** | `object` | Optional | Map of expected headers that must be present in the response. |
| **`maxDurationMs`** | `integer` | Optional | Maximum allowed round-trip duration in milliseconds (latency SLA). |
