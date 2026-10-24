# Changelog

All notable changes to the **RouteCase** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-24

### Added
- **Dynamic Built-in Variables**: Added support for dynamic variables `{{$uuid}}`, `{{$timestamp}}`, `{{$isoDate}}`, `{{$randomEmail}}`, `{{$randomInt}}`, and `{{$randomName}}` across `params`, `query`, `body`, and `headers` without mutating assertions.
- **"Copy as cURL" Command**: Added context menu command `routecase.copyAsCurl` to quickly generate and copy formatted cURL commands for any test case under or closest to the cursor.
- **Environment Variables & .env Support**: Added support for `{{VAR_NAME}}` variable substitution loaded from workspace `.rcase.env`, `.rcase.env.json`, and the `routecase.env` VS Code setting. Added demo template `examples/env-demo.rcase`.
- **Response Variable Chaining (Token Capture)**: Added `capture` directive to extract values from JSON response bodies via dot-notation and inject them into subsequent test cases. Displayed captured variables in the webview results panel.
- **OpenAPI / Swagger Importer**: Added `routecase.importOpenAPI` command to convert OpenAPI 3.x and Swagger 2.x specs (from file or URL) into complete `.rcase` suites with starter success and error test cases.

## [0.1.1] - 2026-10-24

### Added
- **All-Features Showcase Example:** Added comprehensive `all-features.rcase` showcasing every HTTP method (`GET`, `POST`, `PATCH`, `DELETE`), path/query parameters, nested JSON bodies, and assertion types (`status`, `bodyContains`, `bodyEquals`, `headers`, `maxDurationMs`).
- **Live Public API Example:** Added `github-public-api.rcase` querying live GitHub REST endpoints so developers can run tests immediately without starting a local server.
- **E-Commerce CRUD Suite:** Added `ecommerce-crud.rcase` testing product catalogs, order submission, and line item checkout.
- **Auth & Security Suite:** Added `auth-and-security.rcase` demonstrating login JWTs, Bearer token authentication, 401/403 errors, and automatic secret redaction.
- **Interactive Template Chooser:** Enhanced `RouteCase: Create Example Test File` command to prompt with a rich QuickPick selection of real-world templates.
- **Marketplace Master Documentation:** Expanded `README.md` with the full all-included reference example and feature matrix.

## [0.1.0] - 2026-10-24

### Initial Release

#### Added
- Declarative `.rcase` and `.routecase` test file format with full JSON schema validation and IntelliSense.
- Path template substitution engine supporting multiple URL placeholders (e.g. `/api/info/{name}`) with safe segment encoding.
- Separate `success` and `errors` test case blocks expanded into independent HTTP requests.
- Assertions for HTTP status codes, `bodyContains` substring checking, `bodyEquals` deep JSON comparison, headers, and duration limits.
- Native VS Code Activity Bar Tree View showing live progress, status badges (PASS, FAIL, ERROR), and elapsed durations.
- Interactive Webview results panel displaying detailed request/response headers, body previews, assertion breakdowns, and rerun triggers.
- Automatic redaction of sensitive credentials (`Authorization`, `Cookie`, `x-api-key`, etc.) from logs and results.
- Sequential execution engine with timeout configuration, response size limits, and user cancellation support.
- Safe cross-origin redirect prevention.
- Commands:
  - `RouteCase: Run Tests in Current File`
  - `RouteCase: Run All Tests`
  - `RouteCase: Stop Test Run`
  - `RouteCase: Validate Current File`
  - `RouteCase: Create Example Test File`
  - `RouteCase: Open Results Panel`
  - `RouteCase: Rerun Test Case`
