# Commands & Shortcuts Reference

RouteCase registers 9 VS Code commands that can be invoked via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), inline CodeLens buttons, or context menus.

---

## Commands Table

| Command Identifier | Title in Command Palette | UI Trigger Location | Description |
| :--- | :--- | :--- | :--- |
| `routecase.runCurrentFile` | **RouteCase: Run Tests in Current File** | Editor title bar ▶ / CodeLens | Executes all endpoints and test cases in the active `.rcase` file. |
| `routecase.runSingleCase` | **RouteCase: Run Test Case** | CodeLens `▶ Run Case` | Executes an isolated single test scenario without running the rest of the file. |
| `routecase.runEndpoint` | **RouteCase: Run Endpoint Cases** | CodeLens `▶ Run Endpoint` | Executes all success and error cases belonging to a specific route. |
| `routecase.runAll` | **RouteCase: Run All Tests** | Activity Bar Header ▶ | Discovers and executes all `.rcase` and `.routecase` files in the workspace. |
| `routecase.stopRun` | **RouteCase: Stop Test Run** | Command Palette | Cancels the currently executing test run and marks pending cases as CANCELLED. |
| `routecase.validateCurrentFile` | **RouteCase: Validate Current File** | Command Palette | Validates the active `.rcase` file against the official RouteCase schema. |
| `routecase.createExample` | **RouteCase: Create Example Test File** | Command Palette | Opens a QuickPick template selector to scaffold a ready-to-run suite in your project. |
| `routecase.copyAsCurl` | **RouteCase: Copy as cURL** | Right-click Context Menu | Formats the test case nearest your cursor into an executable cURL command on your clipboard. |
| `routecase.importOpenAPI` | **RouteCase: Import OpenAPI / Swagger** | Command Palette | Converts an OpenAPI 3.x or Swagger 2.x specification into an executable `.rcase` file. |
| `routecase.openResultsPanel` | **RouteCase: Open Results Panel** | Tree View / CodeLens badge | Opens the interactive Webview results dashboard. |
| `routecase.rerunCase` | **RouteCase: Rerun Test Case** | Results Panel "Rerun" | Reruns a specific case directly from the results webview. |

---

## Keyboard Shortcuts & Context Menus

### Right-Click Context Menu ("Copy as cURL")
When right-clicking inside any `.rcase` file, RouteCase adds:
```text
RouteCase: Copy as cURL
```
This automatically parses the document, finds the test case closest to your cursor, and copies a full cURL string (with method, URL, headers, and body).
