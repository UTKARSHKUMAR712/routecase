const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// In-memory state for testing
const registeredEmails = new Set(['alice@routecase.test']);
const usersDb = {
  'usr_42': { id: 'usr_42', name: 'Alice Smith', email: 'alice@routecase.test', role: 'admin' },
  '1': { id: '1', name: 'John Doe', email: 'john@routecase.test', role: 'user' }
};

// 1. POST /auth/login -> returns { accessToken, userId }
app.post('/auth/login', (req, res) => {
  const { email, username } = req.body || {};
  res.status(200).json({
    accessToken: 'jwt_sample_token_xyz_987654321',
    userId: 'usr_42',
    user: {
      id: 'usr_42',
      username: username || email || 'alice',
      role: 'admin'
    }
  });
});

// 2. GET /users (paginated query params) or GET /users/:id
app.get('/users', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;

  const sampleUsers = [
    { id: '1', name: 'Alice', email: 'alice@routecase.test' },
    { id: '2', name: 'Bob', email: 'bob@routecase.test' },
    { id: '3', name: 'Charlie', email: 'charlie@routecase.test' },
    { id: '4', name: 'Diana', email: 'diana@routecase.test' },
    { id: '5', name: 'Evan', email: 'evan@routecase.test' }
  ];

  res.status(200).json({
    page,
    limit,
    total: sampleUsers.length,
    users: sampleUsers.slice(0, limit)
  });
});

// 3. GET /users/:id -> returns user object
app.get('/users/:id', (req, res) => {
  const user = usersDb[req.params.id] || {
    id: req.params.id,
    name: 'Dynamic User',
    email: `user_${req.params.id}@routecase.test`
  };

  res.status(200).json(user);
});

// 4. POST /users -> creates user, requires unique email
app.post('/users', (req, res) => {
  const { email, name } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (registeredEmails.has(email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists', email });
  }

  registeredEmails.add(email.toLowerCase());
  const newId = `usr_${Date.now()}`;
  const newUser = { id: newId, name: name || 'Anonymous', email };
  usersDb[newId] = newUser;

  res.status(201).json(newUser);
});

// 5. PUT /users/:id -> full update
app.put('/users/:id', (req, res) => {
  const { name, email } = req.body || {};
  usersDb[req.params.id] = { id: req.params.id, name, email, updated: true };
  res.status(200).json(usersDb[req.params.id]);
});

// 6. PATCH /users/:id -> partial update
app.patch('/users/:id', (req, res) => {
  const existing = usersDb[req.params.id] || { id: req.params.id };
  const updated = { ...existing, ...req.body, patched: true };
  usersDb[req.params.id] = updated;
  res.status(200).json(updated);
});

// 7. DELETE /users/:id -> delete
app.delete('/users/:id', (req, res) => {
  delete usersDb[req.params.id];
  res.status(200).json({ message: 'User deleted', id: req.params.id });
});

// 8. POST /products -> create product (tests {{$uuid}} as productId)
app.post('/products', (req, res) => {
  const { productId, id, name, price } = req.body || {};
  res.status(201).json({
    productId: productId || id || 'prod_default',
    name: name || 'Sample Product',
    price: price || 99,
    status: 'created'
  });
});

// 9. GET /health -> { status: "ok", timestamp: "..." }
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RouteCase Test Server running on port ${PORT}`);
  });
}

module.exports = app;
