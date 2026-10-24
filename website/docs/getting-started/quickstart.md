# Quickstart (3 Minutes)

Get up and running with RouteCase and execute your first API test suite in under 3 minutes.

---

## Step 1: Install RouteCase

Open the VS Code command palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS) and run:

```bash
code --install-extension UtkarshKumar.routecase
```

Or search for **RouteCase** in the Extensions tab (`Ctrl+Shift+X`).

---

## Step 2: Create a Test Suite

In your project root, create a file named `quickstart.rcase`:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "GitHub User API Test",
  "baseUrl": "https://api.github.com",
  "headers": {
    "User-Agent": "RouteCase-Quickstart"
  },
  "tests": [
    {
      "name": "Fetch Public User Profile",
      "method": "GET",
      "path": "/users/{username}",
      "success": [
        {
          "name": "Fetch Octocat User Profile",
          "params": {
            "username": "octocat"
          },
          "expect": {
            "status": 200,
            "bodyContains": "octocat",
            "maxDurationMs": 2500
          }
        }
      ],
      "errors": [
        {
          "name": "Non-existent user returns 404",
          "params": {
            "username": "non-existent-user-routecase-9999999"
          },
          "expect": {
            "status": 404,
            "bodyContains": "Not Found"
          }
        }
      ]
    }
  ]
}
```

::: tip No Local Server Required!
This test suite uses GitHub's public REST API, so you can test RouteCase immediately without needing to run a local server.
:::

---

## Step 3: Run the Tests

You will see clickable **CodeLens actions** appear directly above the JSON code in the editor:

```
[▶ Run All Cases]  [📊 Results Dashboard]
```

1. Click **`▶ Run All Cases`** at the top of the file.
2. Watch the live badge update to **`✓ PASS (200 • 180ms)`**.
3. Click the **RouteCase** icon in the VS Code Activity Bar on the left to see the test tree view.
4. Click on any test result to open the **Interactive Results Panel** and inspect the full response headers and payload preview!

---

## What Just Happened?

1. RouteCase validated the `.rcase` syntax against its JSON schema.
2. The path template `/users/{username}` was substituted with `octocat` and URL-encoded.
3. Node's HTTP/HTTPS engine executed the request with custom headers.
4. The response status (`200 OK`), response body (`octocat`), and latency were asserted.
5. The second error case was executed with the invalid username, verifying that GitHub properly returned `404 Not Found`.

**Next Up:** Learn how to install and configure RouteCase for daily development in the [Installation Guide](./installation.md).
