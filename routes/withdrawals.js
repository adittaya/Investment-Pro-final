const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { mockSupabase, users, withdrawals } = require('../utils/mockDatabase');

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

// Request withdrawal route
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { amount, method, bank_name, ifsc_code, account_number, account_holder_name, upi_id } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    if (!method || !['bank', 'upi'].includes(method)) {
      return res.status(400).json({ error: 'Method must be either "bank" or "upi"' });
    }

    if (method === 'bank' && (!bank_name || !ifsc_code || !account_number || !account_holder_name)) {
      return res.status(400).json({ error: 'Bank details are required for bank withdrawal' });
    }

    if (method === 'upi' && !upi_id) {
      return res.status(400).json({ error: 'UPI ID is required for UPI withdrawal' });
    }

    // Check if user has enough balance (profit balance, not recharge balance)
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow withdrawals from profit balance (user.balance), not from recharge_balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient profit balance. You can only withdraw profits from investments.' });
    }

    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ₹100' });
    }

    // Check if user has already made a withdrawal in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentWithdrawal = withdrawals.find(w => 
      w.user_id === userId && 
      new Date(w.created_at) >= twentyFourHoursAgo &&
      w.status !== 'rejected'
    );

    if (recentWithdrawal) {
      return res.status(400).json({ error: 'You can only make one withdrawal every 24 hours' });
    }

    // Create withdrawal request
    const newWithdrawal = {
      id: `wd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      amount: parseFloat(amount),
      method,
      bank_name: method === 'bank' ? bank_name : null,
      ifsc_code: method === 'bank' ? ifsc_code : null,
      account_number: method === 'bank' ? account_number : null,
      account_holder_name: method === 'bank' ? account_holder_name : null,
      upi_id: method === 'upi' ? upi_id : null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    withdrawals.push(newWithdrawal);

    return res.status(200).json({ 
      message: 'Withdrawal request submitted successfully', 
      withdrawal: newWithdrawal 
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;