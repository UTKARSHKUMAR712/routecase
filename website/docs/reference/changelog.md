# Changelog & Releases

All notable changes to **RouteCase** are documented in this file.
RouteCase adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-10-24

### 🚀 Major Feature Release

#### Added
- **Response Variable Chaining (`capture`):** Extract values from JSON response bodies via dot-notation (e.g. `"myToken": "accessToken"`) and inject them as `{{myToken}}` into downstream requests.
- **Environment Variables (`.rcase.env`):** Native support for `.rcase.env`, `.rcase.env.json`, and VS Code setting `routecase.env`. Switch between local, staging, and production without editing test suites.
- **Dynamic Built-in Generators:** Added `{{$uuid}}`, `{{$timestamp}}`, `{{$isoDate}}`, `{{$randomEmail}}`, `{{$randomName}}`, and `{{$randomInt}}` for collision-free testing.
- **"Copy as cURL" Context Menu:** Right-click any test case in the editor to copy a fully formatted, executable cURL command to the clipboard.
- **OpenAPI & Swagger Importer:** Native zero-dependency importer converting OpenAPI 3.x and Swagger 2.x specifications into complete `.rcase` suites.
- **Expanded Test Coverage:** Added 25 new automated unit and integration tests (totaling 64 passing tests across 13 suites).
- **Express Test Server:** Added `test-server/` with complete integration test harness validating all HTTP methods and variable features.

---

## [0.1.1] - 2026-10-24

### Added
- **All-Features Showcase Example:** Comprehensive `all-features.rcase` covering all HTTP methods, parameters, and assertions.
- **Live Public API Suite:** Added `github-public-api.rcase` allowing developers to test RouteCase without starting a local server.
- **E-Commerce CRUD Suite:** Added `ecommerce-crud.rcase`.
- **Auth & Security Suite:** Added `auth-and-security.rcase`.
- **Interactive Template Chooser:** Enhanced `RouteCase: Create Example Test File` command with an interactive QuickPick menu.

---

## [0.1.0] - 2026-10-24

### Initial Public Release
- Declarative `.rcase` and `.routecase` test file format with full JSON schema validation.
- Interactive Jupyter-style CodeLens actions (`▶ Run All Cases`, `▶ Run Endpoint`, `▶ Run Case`) and live status badges (`✓ PASS`, `✗ FAIL`, `⚠ ERROR`).
- Path template substitution engine with safe URL encoding.
- Assertions engine: `status`, `bodyContains`, `bodyEquals`, `headers`, and `maxDurationMs`.
- Native VS Code Activity Bar Tree View test explorer.
- Interactive Webview results panel with secret credential redaction.
- Published to the official Visual Studio Marketplace under publisher `UtkarshKumar`.
