
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// MIDDLEWARES
const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '10mb' }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

// CORS - CHO PHÉP REACT FRONTEND GỌI API
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3001', // Customer
    'http://localhost:3002', // Admin
    'http://localhost:3003'  // Customer (cổng hiện tại)
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-access-token'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// APIs
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from server!'
  });
});

app.use('/api/admin', require('./api/admin.js'));
app.use('/api/customer', require('./api/customer.js'));

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
