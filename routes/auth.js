const express = require('express');
const bcrypt = require('bcryptjs');
const config = require('../config');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { mockSupabase, findUserByPhone, findUserByUsername, findUserByReferralCode, generateReferralCode, users } = require('../utils/mockDatabase');

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone_number, password, confirm_password, referral_code } = req.body;

    // Validation
    if (!name || !username || !phone_number || !password || !confirm_password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if phone number or username already exists
    const existingUser = users.find(user => 
      user.phone_number === phone_number || user.username === username
    );

    if (existingUser) {
      if (existingUser.phone_number === phone_number) {
        return res.status(400).json({ error: 'Phone number already registered' });
      } else {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Handle referral
    let referred_by = null;
    if (referral_code) {
      const referrer = findUserByReferralCode(referral_code);
      if (referrer) {
        referred_by = referrer.id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate referral code
    const referralCode = generateReferralCode(username);

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      username,
      phone_number,
      password_hash: passwordHash,
      referral_code: referralCode,
      referred_by,
      balance: 0,
      total_invested: 0,
      total_withdrawn: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      is_admin: false
    };

    // Add user to in-memory storage
    users.push(newUser);

    // Return success response (without password hash)
    const { password_hash, ...userWithoutPassword } = newUser;
    return res.status(200).json({ 
      message: 'User registered successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Validation
    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    // Find user by phone number
    const user = findUserByPhone(phone_number);

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone_number: user.phone_number, 
        is_admin: user.is_admin 
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response (without password hash)
    const { password_hash, ...userWithoutPassword } = user;
    return res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;