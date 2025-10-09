const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, userProducts, transactions, products } = require('../utils/mockDatabase');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user products
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's active products
    const userProds = userProducts.filter(up => up.user_id === userId);
    
    // Add product details to each user product
    const productsWithDetails = userProds.map(up => {
      const product = products.find(p => p.id === up.product_id);
      return {
        ...up,
        product_name: product ? product.name : `Plan ${up.product_id}`,
        daily_income: product ? product.daily_income : up.daily_income
      };
    });
    
    return res.status(200).json(productsWithDetails);
  } catch (error) {
    console.error('User products fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's completed transactions
    const userTransactions = transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first
    
    // Get user's pending withdrawals
    const pendingWithdrawals = withdrawals
      .filter(w => w.user_id === userId && w.status === 'pending')
      .map(w => ({
        id: w.id,
        user_id: w.user_id,
        type: 'withdrawal_pending',
        amount: w.amount,
        status: 'pending',
        description: `Pending withdrawal request via ${w.method}`,
        created_at: w.created_at
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Get user's pending recharges
    const pendingRecharges = recharges
      .filter(r => r.user_id === userId && r.status === 'pending')
      .map(r => ({
        id: r.id,
        user_id: r.user_id,
        type: 'recharge_pending',
        amount: r.amount,
        status: 'pending',
        description: 'Pending recharge request',
        created_at: r.created_at
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Combine all transactions and sort by date
    const allTransactions = [...userTransactions, ...pendingWithdrawals, ...pendingRecharges]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return res.status(200).json(allTransactions);
  } catch (error) {
    console.error('User transactions fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;