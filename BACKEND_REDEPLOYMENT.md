# Backend Redeployment Instructions

## Issue
The recharge request functionality on the Netlify deployment (invest-proapp.netlify.app) is failing because the deployed backend at https://investment-pro-backend-fe0b.onrender.com does not have the latest fixes.

## Required Fixes
The following fixes must be applied to the deployed backend:

### 1. Fix in `/routes/auth.js`
In the user registration code (around line 67), ensure new users get the `recharge_balance` property:

```javascript
// Create new user
const newUser = {
  id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  username,
  phone_number,
  password_hash: passwordHash,
  referral_code: referralCode,
  referred_by,
  balance: 0,           // Profit balance (withdrawable)
  recharge_balance: 0,  // Recharge balance (for purchasing plans)  <- This was missing
  total_invested: 0,
  total_withdrawn: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
  is_admin: false
};
```

### 2. Fix in `/routes/user.js`
Ensure the imports include `withdrawals` and `recharges`:

```javascript
const { users, userProducts, transactions, products, withdrawals, recharges } = require('../utils/mockDatabase');
```

### 3. Security Enhancement in `/config.js`
Ensure JWT_SECRET is properly set:

```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'investment_platform_secret_key_for_dev_only';
```

## Steps to Redeploy

### Option 1: Git-based Deployment (Recommended)
If your Render backend is connected to a Git repository:

1. Commit the changes to your repository:
   ```bash
   git add .
   git commit -m "Fix recharge_balance property and other backend issues"
   git push origin main
   ```

2. Render should automatically pick up the changes and redeploy the backend.

### Option 2: Manual Deployment
If you deployed manually:

1. Download the fixed code from the repository
2. Replace the files in your Render project directory with the updated files
3. Restart the Render service

## Verification Steps

After redeployment, verify that:

1. New users are created with `recharge_balance: 0`
2. Product purchase endpoint properly checks `recharge_balance` before allowing purchases
3. Recharge request endpoint works properly
4. All other API endpoints continue to work as expected

## API Proxy Configuration for Netlify

The Netlify deployment is configured properly with these settings:

**In `pages/_redirects`:**
```
# API proxy redirects - forward API requests to the backend server
/api/*  https://investment-pro-backend-fe0b.onrender.com/:splat  200

# Netlify redirects for SPA routing
/*    /index.html   200
```

**In `pages/config.js`:**
```javascript
const CONFIG = {
    API_BASE_URL: ''  // Empty string means relative path to the same domain
};
```

These configurations ensure that API requests from the Netlify frontend are properly forwarded to the backend server.