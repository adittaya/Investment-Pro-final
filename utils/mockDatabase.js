// Mock database for testing purposes
// In a real application, this would interface with Supabase
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

// In-memory storage (replace with Supabase in production)
let users = [
  // Admin user
  {
    id: 'admin-uuid',
    phone_number: '9999999999',
    username: 'admin',
    name: 'Admin User',
    password_hash: bcrypt.hashSync('admin123', 10), // Default password: admin123
    referral_code: 'ADMIN001',
    referred_by: null,
    balance: 0, // This is now the investment profit balance (withdrawable)
    recharge_balance: 0, // This is the recharge-only balance (non-withdrawable)
    total_invested: 0,
    total_withdrawn: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    is_admin: true
  }
];

// Initialize products
let products = [
  { id: 1, name: 'Starter Plan', price: 490.00, daily_income: 80.00, duration: 9, total_return: 720.00, profit: 230.00 },
  { id: 2, name: 'Smart Saver', price: 750.00, daily_income: 85.00, duration: 14, total_return: 1190.00, profit: 440.00 },
  { id: 3, name: 'Bronze Booster', price: 1000.00, daily_income: 100.00, duration: 15, total_return: 1500.00, profit: 500.00 },
  { id: 4, name: 'Silver Growth', price: 1500.00, daily_income: 115.00, duration: 20, total_return: 2300.00, profit: 800.00 },
  { id: 5, name: 'Gold Income', price: 2000.00, daily_income: 135.00, duration: 23, total_return: 3105.00, profit: 1105.00 },
  { id: 6, name: 'Platinum Plan', price: 2500.00, daily_income: 160.00, duration: 24, total_return: 3840.00, profit: 1340.00 },
  { id: 7, name: 'Elite Earning', price: 3000.00, daily_income: 180.00, duration: 25, total_return: 4500.00, profit: 1500.00 },
  { id: 8, name: 'VIP Profiter', price: 3500.00, daily_income: 200.00, duration: 27, total_return: 5400.00, profit: 1900.00 },
  { id: 9, name: 'Executive Growth', price: 4000.00, daily_income: 220.00, duration: 28, total_return: 6160.00, profit: 2160.00 },
  { id: 10, name: 'Royal Investor', price: 5000.00, daily_income: 250.00, duration: 30, total_return: 7500.00, profit: 2500.00 }
];

// Other collections (in a real app, these would be in Supabase)
let userProducts = [];
let transactions = [];
let withdrawals = [];
let referrals = [];
let recharges = [];

// Helper functions
const findUserByPhone = (phone_number) => users.find(user => user.phone_number === phone_number);
const findUserByUsername = (username) => users.find(user => user.username === username);
const findUserByReferralCode = (referral_code) => users.find(user => user.referral_code === referral_code);
const generateReferralCode = (username) => `${username.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

// Mock Supabase module for local testing
const mockSupabase = {
  from: (table) => {
    return {
      select: (fields = '*') => {
        return {
          eq: (field, value) => {
            if (table === 'users') {
              if (field === 'phone_number') {
                const result = users.filter(user => user.phone_number === value);
                return { single: async () => ({ data: result[0] || null, error: result.length ? null : 'User not found' }) };
              } else if (field === 'username') {
                const result = users.filter(user => user.username === value);
                return { single: async () => ({ data: result[0] || null, error: result.length ? null : 'User not found' }) };
              } else if (field === 'referral_code') {
                const result = users.filter(user => user.referral_code === value);
                return { single: async () => ({ data: result[0] || null, error: result.length ? null : 'User not found' }) };
              }
            } else if (table === 'products' && field === 'id') {
              const result = products.filter(product => product.id === value);
              return { single: async () => ({ data: result[0] || null, error: result.length ? null : 'Product not found' }) };
            }
            return { single: async () => ({ data: null, error: 'Not found' }) };
          },
          or: (condition) => {
            if (table === 'users') {
              // Parse the condition "phone_number.eq.1234567890,username.eq.testuser"
              const conditions = condition.split(',');
              let phoneCondition = conditions[0].split('.')[2]; // value after phone_number.eq.
              let usernameCondition = conditions[1].split('.')[2]; // value after username.eq.
              
              const result = users.filter(user => 
                user.phone_number === phoneCondition || user.username === usernameCondition
              );
              
              return { single: async () => ({ data: result[0] || null, error: result.length ? null : 'User not found' }) };
            }
            return { single: async () => ({ data: null, error: 'Not found' }) };
          },
          gte: (field, value) => {
            if (table === 'user_products' && field === 'purchase_date') {
              // Filter user products with purchase date >= value
              return {
                lte: (field2, value2) => {
                  // Filter user products with end date <= value2
                  const result = userProducts.filter(up => 
                    new Date(up.purchase_date) >= new Date(value) &&
                    new Date(up.end_date) <= new Date(value2)
                  );
                  return { 
                    eq: (field3, value3) => {
                      // Further filter by user_id
                      const filtered = result.filter(up => up.user_id === value3);
                      return { 
                        eq: (field4, value4) => {
                          // Further filter by product_id
                          const finalResult = filtered.filter(up => up.product_id === value4);
                          return { 
                            select: () => ({ 
                              single: async () => ({ data: finalResult[0] || null, error: finalResult.length ? null : null }) 
                            })
                          };
                        }
                      };
                    }
                  };
                }
              };
            }
            return { 
              lte: (field2, value2) => ({
                eq: (field3, value3) => ({
                  eq: (field4, value4) => ({
                    select: () => ({ 
                      single: async () => ({ data: null, error: null }) 
                    })
                  })
                })
              })
            };
          },
          lt: (field, value) => {
            if (table === 'user_products') {
              return {
                lt: (field2, value2) => {
                  // Mock filtering for active investments
                  const result = userProducts.filter(up => 
                    new Date(up.purchase_date) < new Date(value) && 
                    new Date(up.end_date) < new Date(value2) && 
                    up.status === 'active'
                  );
                  
                  return {
                    select: (fields = '*') => {
                      if (fields === '*') {
                        // Mock joining with users table
                        const resultWithUsers = result.map(up => ({
                          ...up,
                          user: users.find(u => u.id === up.user_id) || null
                        }));
                        return { 
                          single: async () => ({ data: null, error: null }),
                          data: resultWithUsers
                        };
                      }
                    }
                  };
                }
              };
            }
            return {
              lt: (field2, value2) => ({
                select: (fields = '*') => ({
                  single: async () => ({ data: null, error: null })
                })
              })
            };
          },
          gte: (field, value) => {
            if (table === 'withdrawals' && field === 'created_at') {
              return {
                neq: (field2, value2) => {
                  const result = withdrawals.filter(w => 
                    new Date(w.created_at) >= new Date(value) && w.status !== value2
                  );
                  return { 
                    single: async () => ({ data: result[0] || null, error: null }) 
                  };
                }
              };
            }
            return { 
              neq: (field2, value2) => ({
                single: async () => ({ data: null, error: null })
              })
            };
          }
        };
      },
      insert: (data) => {
        return {
          select: () => {
            if (table === 'users') {
              const newUser = { ...data[0], id: `user-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
              users.push(newUser);
              return { 
                single: async () => ({ 
                  data: newUser, 
                  error: null 
                }) 
              };
            } else if (table === 'user_products') {
              const newProduct = { ...data[0], id: `up-${Date.now()}` };
              userProducts.push(newProduct);
              return { 
                single: async () => ({ 
                  data: newProduct, 
                  error: null 
                }) 
              };
            } else if (table === 'transactions') {
              const newTransaction = { ...data[0], id: `trans-${Date.now()}`, created_at: new Date().toISOString() };
              transactions.push(newTransaction);
              return { 
                single: async () => ({ 
                  data: newTransaction, 
                  error: null 
                }) 
              };
            } else if (table === 'withdrawals') {
              const newWithdrawal = { ...data[0], id: `wd-${Date.now()}`, created_at: new Date().toISOString() };
              withdrawals.push(newWithdrawal);
              return { 
                single: async () => ({ 
                  data: newWithdrawal, 
                  error: null 
                }) 
              };
            } else if (table === 'recharges') {
              const newRecharge = { ...data[0], id: `rc-${Date.now()}`, created_at: new Date().toISOString() };
              recharges.push(newRecharge);
              return { 
                single: async () => ({ 
                  data: newRecharge, 
                  error: null 
                }) 
              };
            }
          }
        };
      },
      update: (updates) => {
        return {
          eq: (field, value) => {
            if (table === 'users' && field === 'id') {
              const userIndex = users.findIndex(u => u.id === value);
              if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date().toISOString() };
                return {
                  select: () => ({
                    single: async () => ({ 
                      data: users[userIndex], 
                      error: null 
                    }) 
                  })
                };
              }
            }
            return {
              select: () => ({
                single: async () => ({ data: null, error: 'Update failed' }) 
              })
            };
          }
        };
      }
    };
  }
};

module.exports = { mockSupabase, users, products, userProducts, transactions, withdrawals, referrals, recharges, generateReferralCode, findUserByPhone, findUserByUsername, findUserByReferralCode };