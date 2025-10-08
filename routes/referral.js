const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { mockSupabase, users, referrals, findUserByReferralCode } = require('../utils/mockDatabase');

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

// Verify referral code route
router.post('/verify-referral', authenticateToken, async (req, res) => {
  try {
    const { referral_code } = req.body;
    const userId = req.user.userId;

    if (!referral_code) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    // Check if referral code exists and is valid
    const referrer = findUserByReferralCode(referral_code);
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // Check if the referrer is not the same as the current user (no self-referral)
    if (referrer.id === userId) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Check if user already has a referred_by value (to prevent changing referral after initial referral)
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (currentUser.referred_by) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // Update the user's referred_by field
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].referred_by = referrer.id;
    }

    return res.status(200).json({ 
      message: 'Referral code applied successfully',
      referrer: {
        id: referrer.id,
        name: referrer.name,
        username: referrer.username
      }
    });
  } catch (error) {
    console.error('Referral verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;