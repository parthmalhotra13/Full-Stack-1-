
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "secret123";

// Dummy users with roles
const USERS = [
  { id: 1, username: "admin", password: "1234", role: "admin" },
  { id: 2, username: "user", password: "1234", role: "user" }
];

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
  res.json({ token, role: user.role });
});

// Middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Role middleware
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// Routes
app.get('/api/admin', verifyToken, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

app.get('/api/user', verifyToken, (req, res) => {
  res.json({ message: "User Profile" });
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
