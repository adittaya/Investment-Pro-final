const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (in production, you should restrict this to your frontend domain)
app.use(cors());

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