# Changelog

All notable changes to the **RouteCase** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
