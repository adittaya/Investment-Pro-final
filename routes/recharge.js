const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { users, recharges } = require('../utils/mockDatabase');

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

// Request recharge route
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be greater than 0' });
    }

    // Create recharge request
    const newRecharge = {
      id: `rc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      amount: parseFloat(amount),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    recharges.push(newRecharge);

    return res.status(200).json({ 
      message: 'Recharge request created successfully', 
      recharge: newRecharge 
    });
  } catch (error) {
    console.error('Recharge request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update recharge with UTR (user submits UTR after making payment)
router.post('/update-utr/:rechargeId', authenticateToken, async (req, res) => {
  try {
    const { rechargeId } = req.params;
    const { utr } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!utr) {
      return res.status(400).json({ error: 'UTR is required' });
    }

    // Find the recharge by ID and ensure it belongs to the user
    const rechargeIndex = recharges.findIndex(rc => rc.id === rechargeId && rc.user_id === userId);
    if (rechargeIndex === -1) {
      return res.status(404).json({ error: 'Recharge request not found or does not belong to user' });
    }

    // Update UTR
    recharges[rechargeIndex].reference_id = utr;

    return res.status(200).json({ 
      message: 'UTR submitted successfully. Admin will verify it shortly.',
      recharge: recharges[rechargeIndex] 
    });
  } catch (error) {
    console.error('Update UTR error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;