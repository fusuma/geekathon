const express = require('express');
const cors = require('cors');

// Import our Lambda handler
const { handler } = require('./dist/handlers/hello');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simulate API Gateway event
app.get('/hello', async (req, res) => {
  try {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      headers: req.headers,
      queryStringParameters: req.query,
      body: null,
    };

    const result = await handler(event);

    // Set response headers
    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Dev server running on http://localhost:${port}`);
  console.log(`📡 Hello endpoint: http://localhost:${port}/hello`);
});