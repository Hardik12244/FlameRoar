const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Welcome to the FlameRoar API!');
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

