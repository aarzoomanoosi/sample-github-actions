const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const webRoot = path.join(__dirname, '..', 'web');

app.use(express.json());
app.use(express.static(webRoot));

app.get('/', (req, res) => {
  res.sendFile(path.join(webRoot, 'index.html'));
});

app.get('/api/sample', (req, res) => {
  res.json({
    message: 'Sample GET endpoint',
    data: {
      id: 1,
      name: 'Dummy User',
      role: 'developer',
    },
  });
});

app.post('/api/sample', (req, res) => {
  res.status(201).json({
    message: 'Sample POST endpoint',
    received: req.body,
    data: {
      id: 2,
      name: 'Created Dummy User',
      role: 'tester',
    },
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
