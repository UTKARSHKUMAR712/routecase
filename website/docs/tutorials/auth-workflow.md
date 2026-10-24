# Tutorial: JWT Auth & Token Chaining

Most microservices and enterprise backends guard sensitive endpoints behind JWT authentication. This tutorial shows how to automate authentication and token chaining using RouteCase.

---

## The Scenario

You have two endpoints:
1. `POST /api/v1/auth/login`: Accepts credentials, returns `{ "token": "ey...", "userId": "usr_99" }`.
2. `GET /api/v1/users/{id}/settings`: Requires `Authorization: Bearer <token>`.

---

## Step 1: Create Environment Credentials

Create a `.rcase.env` file in your workspace:

```ini
API_BASE_URL=https://api.mycompany.dev
TEST_USER_EMAIL=qa-automation@mycompany.dev
TEST_USER_PASSWORD=AutomationSecretPassword123!
```

---

## Step 2: Author the `.rcase` Test Suite

Create `auth-test.rcase`:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Authenticated Workflow",
  "baseUrl": "{{API_BASE_URL}}",
  "headers": {
    "Accept": "application/json"
  },
  "tests": [
    {
      "name": "1. Login Service",
      "method": "POST",
      "path": "/api/v1/auth/login",
      "headers": {
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Authenticate and capture session token",
          "body": {
            "email": "{{TEST_USER_EMAIL}}",
            "password": "{{TEST_USER_PASSWORD}}"
          },
          "capture": {
            "sessionToken": "token",
            "accountUserId": "userId"
          },
          "expect": {
            "status": 200,
            "bodyContains": "token",
            "maxDurationMs": 500
          }
        }
      ],
      "errors": [
        {
          "name": "Bad password returns 401",
          "body": {
            "email": "{{TEST_USER_EMAIL}}",
            "password": "WrongPassword999!"
          },
          "expect": {
            "status": 401,
            "bodyContains": "Invalid credentials"
          }
        }
      ]
    },
    {
      "name": "2. Protected Account Settings",
      "method": "GET",
      "path": "/api/v1/users/{id}/settings",
      "headers": {
        "Authorization": "Bearer {{sessionToken}}"
      },
      "success": [
        {
          "name": "Access user settings using captured token",
          "params": {
            "id": "{{accountUserId}}"
          },
          "expect": {
            "status": 200,
            "maxDurationMs": 300
          }
        }
      ],
      "errors": [
        {
          "name": "Omitted token returns 401 Unauthorized",
          "params": {
            "id": "{{accountUserId}}"
          },
          "headers": {
            "Authorization": ""
          },
          "expect": {
            "status": 401
          }
        }
      ]
    }
  ]
}
```

---

## Step 3: Run the Full Flow

Click **`▶ Run All Cases`**.
RouteCase will:
1. Log in using your `.rcase.env` credentials.
2. Extract the `token` and `userId` from the login JSON response.
3. Automatically inject `{{sessionToken}}` into the `Authorization` header of the second endpoint.
4. Substitute `{{accountUserId}}` into the path template `/api/v1/users/{id}/settings`.
5. Redact `Authorization: Bearer ey...` to `[REDACTED]` in the results panel for security.
