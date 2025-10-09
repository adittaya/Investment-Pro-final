const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { mockSupabase, users, products, userProducts, transactions } = require('../utils/mockDatabase');

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

// Purchase product route
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.userId;

    // Get product details
    const product = products.find(p => p.id === parseInt(product_id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get user details
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough recharge_balance
    if (user.recharge_balance < product.price) {
      return res.status(400).json({ error: 'Insufficient recharge balance' });
    }

    // Check if user has already purchased this product in the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const existingPurchase = userProducts.find(up => 
      up.user_id === userId &&
      up.product_id === product_id &&
      new Date(up.purchase_date) >= startOfMonth &&
      new Date(up.purchase_date) <= endOfMonth
    );

    if (existingPurchase) {
      return res.status(400).json({ error: 'You can only buy this product once per month' });
    }

    // Calculate end date
    const purchaseDate = new Date();
    const endDate = new Date(purchaseDate);
    endDate.setDate(purchaseDate.getDate() + product.duration);

    // Update user recharge_balance and investment totals
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].recharge_balance -= product.price;
      users[userIndex].total_invested += product.price;
      // Move the amount from recharge_balance to balance (now considered invested and generating profit)
    }

    // Create user product record
    const newUserProduct = {
      id: `up-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      product_id: product_id,
      purchase_date: purchaseDate.toISOString(),
      end_date: endDate.toISOString(),
      daily_income: product.daily_income,
      status: 'active',
      created_at: new Date().toISOString()
    };

    userProducts.push(newUserProduct);

    // Add transaction record
    const newTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'investment',
      amount: product.price,
      status: 'completed',
      description: `Purchased ${product.name} investment plan`,
      reference_id: newUserProduct.id,
      created_at: new Date().toISOString()
    };

    transactions.push(newTransaction);

    return res.status(200).json({ 
      message: 'Product purchased successfully', 
      product: newUserProduct 
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Daily profit calculation route (for admin/cron job)
router.post('/daily-profit', authenticateToken, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Only admin can run this operation' });
  }

  try {
    // Get all active investments that haven't been processed today
    const today = new Date().toISOString().split('T')[0];
    
    // Process each active investment
    let processedCount = 0;
    
    for (const investment of userProducts) {
      if (investment.status === 'active') {
        // Check if we already processed profit for today
        const todayDate = new Date().toDateString();
        const purchaseDate = new Date(investment.purchase_date).toDateString();
        const endDate = new Date(investment.end_date).toDateString();
        
        // Only process if investment is active today
        if (new Date() >= new Date(investment.purchase_date) && 
            new Date() <= new Date(investment.end_date)) {
          
          // Find if we already processed today for this investment
          const todayTransaction = transactions.find(t => 
            t.reference_id === investment.id &&
            t.type === 'daily_income' &&
            new Date(t.created_at).toDateString() === todayDate
          );
          
          if (!todayTransaction) {
            // Add daily income to user balance
            const userIndex = users.findIndex(u => u.id === investment.user_id);
            if (userIndex !== -1) {
              users[userIndex].balance += investment.daily_income;
            }

            // Add transaction record
            const newTransaction = {
              id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: investment.user_id,
              type: 'daily_income',
              amount: investment.daily_income,
              status: 'completed',
              description: `Daily income from ${investment.product_id} investment`,
              reference_id: investment.id,
              created_at: new Date().toISOString()
            };

            transactions.push(newTransaction);
            processedCount++;
          }
        }
      }
    }

    return res.status(200).json({ 
      message: `Processed daily profit for ${processedCount} investments`
    });
  } catch (error) {
    console.error('Daily profit calculation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;