const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/page1', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});

app.get('/page2', (req, res) => {
  res.sendFile(path.join(__dirname, 'page2.html'));
});

app.get('/page3', (req, res) => {
  res.sendFile(path.join(__dirname, 'page3.html'));
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Server</h1>
    <ul>
      <li><a href="/page1">Page 1</a></li>
      <li><a href="/page2">Page 2</a></li>
      <li><a href="/page3">Page 3</a></li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});