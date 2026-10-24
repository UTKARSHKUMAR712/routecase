# Tutorial: Testing Live Public APIs (GitHub)

RouteCase is not restricted to local servers. You can test live public APIs over HTTPS immediately without installing any local backend.

---

## Live GitHub REST API Suite

Save this as `github.rcase`:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Live GitHub REST API Test Suite",
  "baseUrl": "https://api.github.com",
  "headers": {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "RouteCase-VSCode-Extension"
  },
  "tests": [
    {
      "name": "Get User Profile",
      "method": "GET",
      "path": "/users/{username}",
      "success": [
        {
          "name": "Octocat public profile",
          "params": { "username": "octocat" },
          "expect": {
            "status": 200,
            "bodyContains": "octocat",
            "maxDurationMs": 2500
          }
        }
      ],
      "errors": [
        {
          "name": "Non-existent user responds with 404",
          "params": { "username": "non-existent-user-routecase-9999999" },
          "expect": {
            "status": 404,
            "bodyContains": "Not Found"
          }
        }
      ]
    },
    {
      "name": "Search Repositories",
      "method": "GET",
      "path": "/search/repositories?q={query}&sort=stars&order=desc",
      "success": [
        {
          "name": "Search for vscode extensions",
          "params": { "query": "topic:vscode-extension" },
          "query": { "per_page": 5 },
          "expect": {
            "status": 200,
            "bodyContains": "total_count"
          }
        }
      ]
    }
  ]
}
```

Open this file in VS Code and click **`▶ Run All Cases`**. You will see live responses coming directly from GitHub!
