// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import our Lambda handlers
const { handler: helloHandler } = require('./dist/handlers/hello');
const { handler: generateHandler } = require('./dist/handlers/generate-dev');
const { handler: authHandler } = require('./dist/handlers/auth');
const { handler: usersHandler } = require('./dist/handlers/users');

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

    const result = await helloHandler(event);

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

// Generate endpoint
app.post('/generate', async (req, res) => {
  try {
    console.log('=== BACKEND RECEIVED ===');
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    console.log('req.body keys:', Object.keys(req.body || {}));
    console.log('JSON.stringify(req.body):', JSON.stringify(req.body));
    
    const event = {
      httpMethod: 'POST',
      path: '/generate',
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
    };

    console.log('Event body:', event.body);

    const result = await generateHandler(event);

    // Set response headers
    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Generate handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth endpoints
app.post('/auth/login', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      path: '/auth/login',
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
    };

    const result = await authHandler(event);

    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users endpoints
app.post('/users', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      path: '/users',
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
    };

    const result = await usersHandler(event);

    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.set(key, result.headers[key]);
      });
    }

    res.status(result.statusCode).send(result.body);
  } catch (error) {
    console.error('Users handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Dev server running on http://localhost:${port}`);
  console.log(`📡 Hello endpoint: http://localhost:${port}/hello`);
  console.log(`📡 Generate endpoint: http://localhost:${port}/generate`);
  console.log(`📡 Auth login endpoint: http://localhost:${port}/auth/login`);
  console.log(`📡 Users endpoint: http://localhost:${port}/users`);
});