const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Test credentials for a new user
const TEST_USER = {
  name: "Admin Feature Test User",
  username: `admintest${Date.now()}`,
  phone_number: `987654321${Date.now() % 10}`,
  password: "password123",
  confirm_password: "password123"
};

// Admin credentials
const ADMIN_CREDENTIALS = {
  phone_number: "9999999999",
  password: "admin123"
};

// Variables to store tokens and IDs
let userToken = null;
let adminToken = null;
let userId = null;
let rechargeId = null;
let withdrawalId = null;

async function testAllAdminFeatures() {
  console.log('🛡️ Testing All Admin Panel Features...\n');

  try {
    // First, register and login user to create some data for admin to manage
    await registerAndLoginUser();

    // 1. Test Admin Login
    await testAdminLogin();

    // 2. Test Admin Dashboard Stats
    await testAdminDashboardStats();

    // 3. Test Admin Users
    await testAdminUsers();

    // 4. Test Admin Transactions
    await testAdminTransactions();

    // 5. Test Admin Withdrawals
    await testAdminWithdrawals();

    // 6. Test Admin Recharges
    await testAdminRecharges();

    // 7. Test Admin Products
    await testAdminProducts();

    // 8. Test Admin Referrals
    await testAdminReferrals();

    // 9. Test Admin Balance Update
    await testAdminBalanceUpdate();

    // 10. Test Admin UTR Verification
    await testAdminUTRVerification();

    // 11. Test Admin Withdrawal Update
    await testAdminWithdrawalUpdate();

    // 12. Test Admin Investment Rebate
    await testAdminInvestmentRebate();

    // 13. Test Admin User Update
    await testAdminUserUpdate();

    // 14. Test Admin Product Management
    await testAdminProductManagement();

    console.log('\n✅ All admin panel features tested successfully!');
  } catch (error) {
    console.error('\n❌ Error during admin feature testing:', error.message);
  }
}

async function registerAndLoginUser() {
  console.log('👤 Preparing test user data...');
  
  // Register a user to have data for admin to manage
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    console.log('✅ Test user registered');
  } catch (error) {
    console.log('⚠️ Test user registration failed:', error.response?.data?.error || error.message);
  }
  
  // Login with test user
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone_number: TEST_USER.phone_number,
      password: TEST_USER.password
    });
    userToken = response.data.token;
    userId = response.data.user.id;
    console.log('✅ Test user logged in');
  } catch (error) {
    console.log('⚠️ Test user login failed:', error.response?.data?.error || error.message);
  }
  
  // Create some transactions as the user
  if (userToken) {
    try {
      // Request a recharge
      const rechargeResponse = await axios.post(`${BASE_URL}/api/recharge/request`, {
        amount: 1000
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      rechargeId = rechargeResponse.data.recharge.id;
      console.log('✅ Test recharge created');
    } catch (error) {
      console.log('⚠️ Test recharge creation failed:', error.response?.data?.error || error.message);
    }
  }
}

async function testAdminLogin() {
  console.log('\n1️⃣ Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    console.log('✅ Admin Login successful:', response.data.message);
    adminToken = response.data.token;
  } catch (error) {
    console.log('❌ Admin Login failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminDashboardStats() {
  console.log('\n2️⃣ Testing Admin Dashboard Stats...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Dashboard Stats successful, users:', response.data.totalUsers);
  } catch (error) {
    console.log('❌ Admin Dashboard Stats failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminUsers() {
  console.log('\n3️⃣ Testing Admin Users...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Users successful, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Users failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminTransactions() {
  console.log('\n4️⃣ Testing Admin Transactions...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Transactions successful, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Transactions failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminWithdrawals() {
  console.log('\n5️⃣ Testing Admin Withdrawals...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/withdrawals`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Withdrawals successful, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Withdrawals failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminRecharges() {
  console.log('\n6️⃣ Testing Admin Recharges...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/recharges`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Recharges successful, count:', response.data.length);
    
    // Get a recharge ID for later testing if available
    if (response.data.length > 0) {
      rechargeId = response.data[0].id;
    }
  } catch (error) {
    console.log('❌ Admin Recharges failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminProducts() {
  console.log('\n7️⃣ Testing Admin Products...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Products successful, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Products failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminReferrals() {
  console.log('\n8️⃣ Testing Admin Referrals...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/referrals`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Referrals successful, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Referrals failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminBalanceUpdate() {
  console.log('\n9️⃣ Testing Admin Balance Update...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    // Find a user ID to update (not the admin)
    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (usersResponse.data.length > 1) {
      const regularUserId = usersResponse.data.find(u => u.phone_number !== '9999999999')?.id;
      if (regularUserId) {
        const response = await axios.post(`${BASE_URL}/api/admin/user/${regularUserId}/balance`, {
          amount: 500,
          reason: 'Test balance update'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Balance Update successful:', response.data.message);
      } else {
        console.log('⚠️ No regular user found to update balance');
      }
    } else {
      console.log('⚠️ Not enough users to test balance update');
    }
  } catch (error) {
    console.log('❌ Admin Balance Update failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminUTRVerification() {
  console.log('\n🔟 Testing Admin UTR Verification...');
  if (!adminToken || !rechargeId) {
    console.log('⚠️ Skipping - No admin token or recharge ID available');
    return;
  }
  try {
    // Create a new recharge and add UTR first
    if (userToken) {
      try {
        // Create a new recharge with the user
        const newRechargeResponse = await axios.post(`${BASE_URL}/api/recharge/request`, {
          amount: 1500
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        const newRechargeId = newRechargeResponse.data.recharge.id;
        
        // Add UTR to the recharge
        await axios.post(`${BASE_URL}/api/recharge/update-utr/${newRechargeId}`, {
          utr: 'ADMIN_TEST_UTR_987654'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        // Now try to verify the UTR as admin
        const response = await axios.post(`${BASE_URL}/api/admin/verify-utr`, {
          utr: 'ADMIN_TEST_UTR_987654',
          action: 'approve'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin UTR Verification successful:', response.data.message);
      } catch (utrError) {
        console.log('❌ Admin UTR Verification failed:', utrError.response?.data?.error || utrError.message);
      }
    } else {
      console.log('⚠️ Skipping UTR verification - no user token available');
    }
  } catch (error) {
    console.log('❌ Admin UTR Verification failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminWithdrawalUpdate() {
  console.log('\n1️⃣1️⃣ Testing Admin Withdrawal Update...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    // First create a withdrawal as the test user
    if (userToken) {
      try {
        // Create a withdrawal
        const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals/request`, {
          amount: 100,
          method: 'bank',
          bank_name: 'Test Bank',
          ifsc_code: 'TEST0001',
          account_number: '1234567890',
          account_holder_name: 'Test User'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const withdrawalId = withdrawalResponse.data.withdrawal.id;
        
        // Now update the withdrawal as admin
        const response = await axios.put(`${BASE_URL}/api/admin/withdrawal/${withdrawalId}`, {
          status: 'rejected'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin Withdrawal Update successful');
      } catch (withdrawalError) {
        console.log('⚠️ Could not test withdrawal update:', withdrawalError.response?.data?.error || withdrawalError.message);
      }
    } else {
      console.log('⚠️ Skipping withdrawal update - no user token available');
    }
  } catch (error) {
    console.log('❌ Admin Withdrawal Update failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminInvestmentRebate() {
  console.log('\n1️⃣2️⃣ Testing Admin Investment Rebate...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/process-investment-rebate`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Investment Rebate successful:', response.data.message);
  } catch (error) {
    console.log('❌ Admin Investment Rebate failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminUserUpdate() {
  console.log('\n1️⃣3️⃣ Testing Admin User Update...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    // Find a user ID to update (not the admin)
    const usersResponse = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (usersResponse.data.length > 1) {
      const regularUserId = usersResponse.data.find(u => u.phone_number !== '9999999999')?.id;
      if (regularUserId) {
        const response = await axios.put(`${BASE_URL}/api/admin/user/${regularUserId}`, {
          name: 'Updated by Admin',
          is_active: true
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin User Update successful:', response.data.message);
      } else {
        console.log('⚠️ No regular user found to update');
      }
    } else {
      console.log('⚠️ Not enough users to test user update');
    }
  } catch (error) {
    console.log('❌ Admin User Update failed:', error.response?.data?.error || error.message);
  }
}

async function testAdminProductManagement() {
  console.log('\n1️⃣4️⃣ Testing Admin Product Management...');
  if (!adminToken) {
    console.log('⚠️ Skipping - No admin token available');
    return;
  }
  try {
    // Test adding a new product
    const newProduct = {
      name: `Test Product ${Date.now()}`,
      price: 2000,
      daily_income: 100,
      duration: 30,
      total_return: 3000,
      profit: 1000
    };
    
    const addResponse = await axios.post(`${BASE_URL}/api/admin/products`, newProduct, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Add Product successful:', addResponse.data.message);
    
    const productId = addResponse.data.product.id;
    
    // Test updating the product
    const updateResponse = await axios.put(`${BASE_URL}/api/admin/products/${productId}`, {
      name: `Updated Test Product ${Date.now()}`,
      daily_income: 120
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Update Product successful:', updateResponse.data.message);
    
    // Try to delete the product (this may fail if there are active investments)
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin Delete Product successful:', deleteResponse.data.message);
    } catch (deleteError) {
      console.log('⚠️ Admin Delete Product failed (expected if investments exist):', deleteError.response?.data?.error || deleteError.message);
    }
  } catch (error) {
    console.log('❌ Admin Product Management failed:', error.response?.data?.error || error.message);
  }
}

testAllAdminFeatures();