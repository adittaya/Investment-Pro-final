const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with options for production deployment 
// For local development and when deployed with proxy, allow all origins
// For production with specific frontend domain, configure origin accordingly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, replace with your specific frontend domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:8080',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://invest-proapp.netlify.app',  // Your Netlify deployment
      process.env.FRONTEND_URL  // Allow setting frontend URL via environment variable
    ].filter(Boolean); // Remove undefined values
    
    const isAllowed = !origin || allowedOrigins.includes(origin);
    callback(null, isAllowed);
  },
  credentials: true
};

app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'pages' directory
app.use(express.static(path.join(__dirname, 'pages')));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const withdrawalRoutes = require('./routes/withdrawals');
const rechargeRoutes = require('./routes/recharge');
const referralRoutes = require('./routes/referral');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});