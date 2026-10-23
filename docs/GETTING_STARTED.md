# Getting Started with RouteCase

Welcome to **RouteCase**! This guide walks you through installing, creating your first test suite, executing HTTP API tests, and inspecting results in VS Code.

---

## 1. Installation

### From VSIX Package (Local)
You can install the packaged VSIX release directly inside VS Code:

1. Open VS Code.
2. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS).
3. Type and select **Extensions: Install from VSIX...**.
4. Select `routecase-0.1.0.vsix`.

Alternatively, install it from the terminal:
```bash
code --install-extension routecase-0.1.0.vsix
```

### From Visual Studio Code Marketplace
Search for **RouteCase** in the Extensions sidebar (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

---

## 2. Creating Your First `.rcase` Test File

You can either:
- Run the command: `RouteCase: Create Example Test File` from the Command Palette, or
- Create a new file named `api.rcase` anywhere in your workspace.

Paste this minimal test suite:

```json
{
  "$schema": "https://raw.githubusercontent.com/routecase/routecase/main/schemas/rcase.schema.json",
  "name": "My First API Test",
  "baseUrl": "http://localhost:3000",
  "tests": [
    {
      "name": "Get superhero by name",
      "method": "GET",
      "path": "/api/info/{name}",
      "success": [
        {
          "name": "Find Batman",
          "params": {
            "name": "Batman"
          },
          "expect": {
            "status": 200,
            "bodyContains": "Batman"
          }
        }
      ],
      "errors": [
        {
          "name": "Unknown superhero returns 404",
          "params": {
            "name": "UnknownHero123"
          },
          "expect": {
            "status": 404
          }
        }
      ]
    }
  ]
}
```

---

## 3. Running Your Tests

There are 3 convenient ways to run your tests:

1. **Title Bar Button:** Whenever a `.rcase` or `.routecase` file is open in the active editor, click the **Play** icon (`Run Tests in Current File`) in the top right editor tab.
2. **Command Palette:** Press `Ctrl+Shift+P` and choose:
   - `RouteCase: Run Tests in Current File` to execute the active file.
   - `RouteCase: Run All Tests` to discover and execute all `.rcase` files in the workspace.
3. **Sidebar Tree View:** Click the **RouteCase** icon in the VS Code Activity Bar on the left, then click the **Run** button on the view header.

---

## 4. Viewing Results & Assertions

RouteCase provides two native viewing experiences:

### 1. Activity Bar Test Explorer
The sidebar tree view groups test results by endpoint:
- `[GET] Get superhero by name`
  - `✓ Find Batman (200 - 45ms)`
  - `✓ Unknown superhero returns 404 (404 - 18ms)`

Click any test case in the tree to open the full diagnostic panel.

### 2. Interactive Webview Dashboard
Run `RouteCase: Open Results Panel` to see:
- Overall progress bar and percentage pass rate.
- Statistics cards: **Total**, **Passed**, **Failed**, **Errors**, and **Duration**.
- Quick status filters (`All`, `Passed`, `Failed`, `Errors`).
- Expandable cards for each test showing:
  - Exact requested URL with parameters expanded.
  - Expected HTTP status vs. Actual status.
  - Redacted request headers.
  - Formatted response headers.
  - Formatted response body preview.
  - Checklist of all assertions with pass/fail explanations.
  - **Rerun** button for instant debugging.

---

## 5. Cancelling Running Tests

If a test suite is taking too long or an API server hangs:
- Click the **Cancel** button on the VS Code progress notification, or
- Run `RouteCase: Stop Test Run` from the Command Palette, or
- Click the **Stop** icon on the RouteCase sidebar view.
