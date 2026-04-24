
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "secret123";

// Dummy user
const USER = { id: 1, username: "admin", password: "1234" };

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== USER.username || password !== USER.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: USER.id, username: USER.username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: "Welcome admin", user: req.user });
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
