# Environment Variables (.rcase.env)

Hardcoding base URLs, API keys, and database secrets in test files is a security risk and prevents easy switching between staging and production. RouteCase solves this with native environment file support.

---

## 1. Dotenv Format (`.rcase.env`)

Create a `.rcase.env` file in the root of your workspace:

```ini
API_BASE_URL=http://localhost:4000
API_KEY=dev-secret-key-123
ADMIN_USER_ID=usr_admin_001
TIMEOUT=5000
```

### Formatting Rules
- Key-value pairs separated by `=`
- Lines beginning with `#` are treated as comments
- Whitespace is automatically trimmed
- Double quotes around values are stripped

---

## 2. JSON Format (`.rcase.env.json`)

Alternatively, you can provide an `.rcase.env.json` file:

```json
{
  "API_BASE_URL": "https://staging.myapp.com",
  "API_KEY": "staging-api-key-9988",
  "ADMIN_USER_ID": "usr_staging_42"
}
```

---

## 3. Usage in `.rcase` Test Files

Reference your environment variables with `{{VAR_NAME}}`:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "User Profile Test",
  "baseUrl": "{{API_BASE_URL}}",
  "headers": {
    "x-api-key": "{{API_KEY}}"
  },
  "tests": [
    {
      "name": "Get Admin Details",
      "method": "GET",
      "path": "/users/{id}",
      "success": [
        {
          "name": "Fetch Admin Profile",
          "params": {
            "id": "{{ADMIN_USER_ID}}"
          },
          "expect": {
            "status": 200
          }
        }
      ]
    }
  ]
}
```

::: tip Managing Multiple Environments
Create separate files: `.rcase.env.local`, `.rcase.env.staging`, and `.rcase.env.prod`. Copy the appropriate file to `.rcase.env` whenever you want to switch your active target environment!
:::
