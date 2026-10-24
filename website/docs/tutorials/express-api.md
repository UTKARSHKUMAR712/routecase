# Tutorial: Testing a Node.js Express REST API

In this tutorial, you'll learn how to write a full RouteCase test suite for a standard Node.js Express API.

---

## The Express Backend

Consider a standard Express CRUD server running on port `3000`:

```javascript
const express = require('express');
const app = express();
app.use(express.json());

const users = new Map([
  ['1', { id: '1', name: 'Alice', role: 'admin' }],
  ['2', { id: '2', name: 'Bob', role: 'user' }]
]);

// GET /api/users/:id
app.get('/api/users/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  const id = String(users.size + 1);
  const newUser = { id, name, email };
  users.set(id, newUser);
  res.status(201).json(newUser);
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Writing `express-api.rcase`

Create a file named `express-api.rcase` in your VS Code workspace:

```json
{
  "$schema": "https://raw.githubusercontent.com/UTKARSHKUMAR712/routecase/main/schemas/rcase.schema.json",
  "name": "Express Users Service API",
  "baseUrl": "http://localhost:3000",
  "headers": {
    "Accept": "application/json"
  },
  "tests": [
    {
      "name": "Get User by ID",
      "method": "GET",
      "path": "/api/users/{id}",
      "success": [
        {
          "name": "Fetch Admin User",
          "params": { "id": "1" },
          "expect": {
            "status": 200,
            "bodyEquals": {
              "id": "1",
              "name": "Alice",
              "role": "admin"
            },
            "maxDurationMs": 200
          }
        }
      ],
      "errors": [
        {
          "name": "Non-existent user returns 404",
          "params": { "id": "999" },
          "expect": {
            "status": 404,
            "bodyContains": "User not found"
          }
        }
      ]
    },
    {
      "name": "Create New User",
      "method": "POST",
      "path": "/api/users",
      "headers": {
        "Content-Type": "application/json"
      },
      "success": [
        {
          "name": "Register valid user with dynamic email",
          "body": {
            "name": "{{$randomName}}",
            "email": "{{$randomEmail}}"
          },
          "expect": {
            "status": 201,
            "bodyContains": "id",
            "maxDurationMs": 300
          }
        }
      ],
      "errors": [
        {
          "name": "Missing email returns 400",
          "body": {
            "name": "Incomplete User"
          },
          "expect": {
            "status": 400,
            "bodyContains": "required"
          }
        }
      ]
    }
  ]
}
```

---

## Running the Suite

1. Start your Express server: `node server.js`.
2. In VS Code, open `express-api.rcase`.
3. Click **`▶ Run All Cases`** at the top.
4. All 4 test cases will execute sequentially, producing instant green status badges!
