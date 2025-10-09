const express = require('express');
const config = require('../config');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { mockSupabase, users, products, userProducts, transactions, withdrawals, referrals, recharges, findUserByReferralCode, generateReferralCode } = require('../utils/mockDatabase');

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

// Verify if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard-stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Calculate stats
    const totalUsers = users.length;
    
    // Count active investments
    const now = new Date();
    const activeProducts = userProducts.filter(up => 
      up.status === 'active' && 
      new Date(up.end_date) >= now
    ).length;
    
    // Calculate total recharges for completed recharges
    const totalRecharges = recharges
      .filter(rc => rc.status === 'approved' || rc.status === 'completed')
      .reduce((sum, rc) => sum + rc.amount, 0);
    
    // Count pending withdrawals
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    return res.status(200).json({
      totalUsers,
      activeProducts,
      totalRecharges,
      pendingWithdrawals
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Return all users (excluding password hash for security)
    const usersWithoutPassword = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.status(200).json(usersWithoutPassword);
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions
router.get('/transactions', authenticateToken, requireAdmin, (req, res) => {
  try {
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all withdrawals
router.get('/withdrawals', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Enhance withdrawals with user details
    const enhancedWithdrawals = withdrawals.map(withdrawal => {
      const user = users.find(u => u.id === withdrawal.user_id);
      return {
        ...withdrawal,
        user_phone: user ? user.phone_number : 'Unknown',
        user_username: user ? user.username : 'Unknown'
      };
    });
    
    return res.status(200).json(enhancedWithdrawals);
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all recharges
router.get('/recharges', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Enhance recharges with user details
    const enhancedRecharges = recharges.map(recharge => {
      const user = users.find(u => u.id === recharge.user_id);
      return {
        ...recharge,
        user_phone: user ? user.phone_number : 'Unknown',
        user_username: user ? user.username : 'Unknown'
      };
    });
    
    return res.status(200).json(enhancedRecharges);
  } catch (error) {
    console.error('Error getting recharges:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products
router.get('/products', authenticateToken, requireAdmin, (req, res) => {
  try {
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all referrals
router.get('/referrals', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Format referrals data
    const formattedReferrals = users
      .filter(user => user.referred_by) // Only users with a referrer
      .map(user => {
        const referrer = users.find(u => u.id === user.referred_by);
        return {
          id: user.id,
          user_name: user.name,
          user_username: user.username,
          referrer_id: referrer ? referrer.id : null,
          referral_date: user.created_at
        };
      });
    
    return res.status(200).json(formattedReferrals);
  } catch (error) {
    console.error('Error getting referrals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add or update user balance
router.post('/user/:userId/balance', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    // Find user by ID, phone number, or username
    let userIndex = users.findIndex(u => u.id === userId);
    
    // If not found by ID, try to find by phone number
    if (userIndex === -1) {
      userIndex = users.findIndex(u => u.phone_number === userId);
    }
    
    // If not found by phone number, try to find by username
    if (userIndex === -1) {
      userIndex = users.findIndex(u => u.username === userId);
    }
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found. Please enter a valid User ID, Phone Number, or Username.' });
    }
    
    const user = users[userIndex];

    // Update user balance
    users[userIndex].balance += parseFloat(amount);

    // Add transaction record
    const newTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'admin_adjustment',
      amount: parseFloat(amount),
      status: 'completed',
      description: `Admin adjustment: ${reason}`,
      reference_id: `ADJ-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    transactions.push(newTransaction);

    // Return updated user info
    const { password_hash, ...updatedUser } = users[userIndex];
    return res.status(200).json({ 
      message: 'Balance updated successfully',
      user: updatedUser,
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify UTR (for recharges)
router.post('/verify-utr', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { utr, action } = req.body;

    if (!utr) {
      return res.status(400).json({ error: 'UTR number is required' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    // Find the recharge request by UTR only (not by ID)
    const recharge = recharges.find(r => r.utr_number === utr);
    if (!recharge) {
      return res.status(404).json({ error: `Recharge with UTR ${utr} not found or UTR number not submitted by user` });
    }

    // Check if already processed
    if (recharge.status === 'approved' || recharge.status === 'rejected' || recharge.status === 'completed') {
      return res.status(400).json({ error: 'This recharge has already been processed' });
    }

    // Update status based on action
    const newStatus = action === 'approve' ? 'completed' : 'failed';
    const rechargeIndex = recharges.findIndex(r => r.utr_number === utr);
    
    if (rechargeIndex !== -1) {
      recharges[rechargeIndex].status = newStatus;
      recharges[rechargeIndex].processed_at = new Date().toISOString();

      // If approved, add the amount to user's recharge_balance
      if (action === 'approve') {
        const userIndex = users.findIndex(u => u.id === recharge.user_id);
        if (userIndex !== -1) {
          users[userIndex].recharge_balance += recharge.amount;
        }

        // Add transaction record
        const newTransaction = {
          id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: recharge.user_id,
          type: 'recharge',
          amount: recharge.amount,
          status: 'completed',
          description: `Recharge via UTR: ${utr}`,
          reference_id: utr,
          created_at: new Date().toISOString()
        };

        transactions.push(newTransaction);
      }
    }

    return res.status(200).json({ 
      message: `Recharge ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Error verifying UTR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update withdrawal status
router.put('/withdrawal/:withdrawalId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
    }

    // Find the withdrawal request
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: `Withdrawal with ID ${withdrawalId} not found` });
    }

    // Check if already processed
    if (withdrawal.status === 'approved' || withdrawal.status === 'rejected') {
      return res.status(400).json({ error: 'This withdrawal has already been processed' });
    }

    // Update status
    const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId);
    if (withdrawalIndex !== -1) {
      withdrawals[withdrawalIndex].status = status;
      withdrawals[withdrawalIndex].processed_at = new Date().toISOString();

      // If approved, deduct the amount from user's balance and update totals
      if (status === 'approved') {
        const userIndex = users.findIndex(u => u.id === withdrawal.user_id);
        if (userIndex !== -1) {
          // Deduct the amount from user's profit balance (not recharge balance)
          users[userIndex].balance -= withdrawal.amount;
          users[userIndex].total_withdrawn += withdrawal.amount;
        }

        // Add transaction record
        const newTransaction = {
          id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: withdrawal.user_id,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: 'completed',
          description: `Withdrawal via ${withdrawal.method}: ${withdrawal.method === 'bank' ? withdrawal.bank_name : withdrawal.upi_id}`,
          reference_id: withdrawalId,
          created_at: new Date().toISOString()
        };

        transactions.push(newTransaction);
      }
    }
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Process investment rebate (reduce duration by 1 day and add daily profit)
router.post('/process-investment-rebate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    let usersAffected = 0;
    let totalAmountAdded = 0;

    // Process all active investments
    for (const investment of userProducts) {
      if (investment.status === 'active' && new Date(investment.end_date) > now) {
        // Find the user who owns this investment
        const user = users.find(u => u.id === investment.user_id);
        if (user) {
          // Add daily profit to user's balance
          user.balance += investment.daily_income;
          totalAmountAdded += investment.daily_income;
          usersAffected++;

          // Add transaction record
          const newTransaction = {
            id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: investment.user_id,
            type: 'investment_rebate',
            amount: investment.daily_income,
            status: 'completed',
            description: `Investment rebate: Daily profit added for ${investment.product_id}`,
            reference_id: investment.id,
            created_at: new Date().toISOString()
          };

          transactions.push(newTransaction);

          // Reduce the end date by 1 day
          const newEndDate = new Date(investment.end_date);
          newEndDate.setDate(newEndDate.getDate() - 1);
          investment.end_date = newEndDate.toISOString();

          // Check if investment is now completed
          if (newEndDate <= now) {
            investment.status = 'completed';
          }
        }
      }
    }

    // Add a record of this rebate operation
    const rebateRecord = {
      id: `rebate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      users_affected: usersAffected,
      total_amount_added: totalAmountAdded,
      admin_id: req.user.userId,
      created_at: new Date().toISOString()
    };

    // In a real application, you might want to store this in a separate rebate history table
    // For this mock implementation, we're just logging it

    return res.status(200).json({ 
      message: `Investment rebate applied successfully`,
      usersAffected,
      totalAmountAdded,
      rebateRecord
    });
  } catch (error) {
    console.error('Error processing investment rebate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user details
router.put('/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Find user
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields (excluding password hash to prevent direct password updates)
    const allowedFields = ['username', 'name', 'phone_number', 'balance', 'total_invested', 
                          'total_withdrawn', 'referral_code', 'referred_by', 'is_active', 'is_admin'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        users[userIndex][key] = value;
      }
    }

    // If password is provided, hash it and update
    if (updates.password) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(updates.password, 10);
      users[userIndex].password_hash = passwordHash;
    }

    users[userIndex].updated_at = new Date().toISOString();

    // Return updated user (without password hash)
    const { password_hash, ...updatedUser } = users[userIndex];
    return res.status(200).json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new product
router.post('/products', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, price, daily_income, duration, total_return, profit } = req.body;

    if (!name || price === undefined || daily_income === undefined || 
        duration === undefined || total_return === undefined || profit === undefined) {
      return res.status(400).json({ error: 'All product fields are required' });
    }

    // Generate new ID (in a real app, this would be handled by the database)
    const newId = Math.max(...products.map(p => p.id), 0) + 1;

    const newProduct = {
      id: newId,
      name,
      price: parseFloat(price),
      daily_income: parseFloat(daily_income),
      duration: parseInt(duration),
      total_return: parseFloat(total_return),
      profit: parseFloat(profit)
    };

    products.push(newProduct);
    return res.status(201).json({ 
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing product
router.put('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const productIndex = products.findIndex(p => p.id == productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update allowed fields
    const allowedFields = ['name', 'price', 'daily_income', 'duration', 'total_return', 'profit'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        products[productIndex][key] = typeof value === 'string' && 
          (key === 'price' || key === 'daily_income' || key === 'total_return' || key === 'profit') 
          ? parseFloat(value) 
          : key === 'duration' 
            ? parseInt(value) 
            : value;
      }
    }

    return res.status(200).json({ 
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a product
router.delete('/products/:productId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { productId } = req.params;

    const productIndex = products.findIndex(p => p.id == productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if any users currently have active investments in this product
    const activeInvestments = userProducts.filter(up => 
      up.product_id == productId && up.status === 'active'
    );

    if (activeInvestments.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with active investments. Please wait for all investments to complete.' 
      });
    }

    // Remove the product
    const deletedProduct = products.splice(productIndex, 1)[0];
    return res.status(200).json({ 
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;