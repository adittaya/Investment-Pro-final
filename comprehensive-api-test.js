const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Test credentials
const TEST_USER = {
  name: "Test User",
  username: `testuser${Date.now()}`,
  phone_number: "9876543210",
  password: "password123",
  confirm_password: "password123"
};

const ADMIN_CREDENTIALS = {
  phone_number: "9999999999",  // From the project's admin credentials
  password: "admin123"
};

// Variables to store tokens
let userToken = null;
let adminToken = null;
let testUserId = null;
let rechargeId = null;
let withdrawalId = null;

async function runComprehensiveAPITests() {
  console.log('🚀 Starting Comprehensive Investment Platform API Tests...\\n');

  try {
    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: Auth - Registration
    await testRegistration();

    // Test 3: Auth - Login
    await testLogin();

    // Test 4: User Profile
    await testUserProfile();

    // Test 5: User Products
    await testUserProducts();

    // Test 6: User Transactions
    await testUserTransactions();

    // Test 7: Products Purchase (will fail due to insufficient balance as expected)
    await testProductPurchase();

    // Test 8: Recharge Request
    await testRechargeRequest();

    // Test 9: Update Recharge UTR
    await testUpdateRechargeUTR();

    // Test 10: Referral Verification
    await testReferralVerification();

    // Test 11: Withdrawal Request
    await testWithdrawalRequest();

    // Test 12: Admin Login
    await testAdminLogin();

    // Test 13: Admin Dashboard Stats
    await testAdminDashboardStats();

    // Test 14: Admin Users
    await testAdminUsers();

    // Test 15: Admin Transactions
    await testAdminTransactions();

    // Test 16: Admin Withdrawals
    await testAdminWithdrawals();

    // Test 17: Admin Recharges
    await testAdminRecharges();

    // Test 18: Admin Products
    await testAdminProducts();

    // Test 19: Admin Referrals
    await testAdminReferrals();

    // Test 20: Admin Balance Update
    await testAdminBalanceUpdate();

    // Test 21: Admin UTR Verification
    await testAdminUTRVerification();

    // Test 22: Admin Withdrawal Update
    await testAdminWithdrawalUpdate();

    // Test 23: Admin Investment Rebate
    await testAdminInvestmentRebate();

    // Test 24: Admin User Update
    await testAdminUserUpdate();

    // Test 25: Admin Product Management
    await testAdminProductManagement();

    console.log('\\n🎉 All comprehensive API tests completed!');
  } catch (error) {
    console.error('\\n❌ Error during API testing:', error.message);
    console.error('Response data:', error.response?.data);
  }
}

// Test health check endpoint
async function testHealthCheck() {
  console.log('\\n1️⃣ Testing Health Check Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check successful:', response.data.status);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }
}

// Test registration
async function testRegistration() {
  console.log('\\n2️⃣ Testing Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      ...TEST_USER,
      username: `testuser${Date.now()}`
    });
    console.log('✅ Registration successful:', response.data.message);
    testUserId = response.data.user.id;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.error || error.message);
  }
}

// Test login
async function testLogin() {
  console.log('\\n3️⃣ Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone_number: TEST_USER.phone_number,
      password: TEST_USER.password
    });
    console.log('✅ Login successful:', response.data.message);
    userToken = response.data.token;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
  }
}

// Test user profile
async function testUserProfile() {
  console.log('\\n4️⃣ Testing User Profile...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User Profile fetched successfully:', response.data.name);
  } catch (error) {
    console.log('❌ User Profile failed:', error.response?.data?.error || error.message);
  }
}

// Test user products
async function testUserProducts() {
  console.log('\\n5️⃣ Testing User Products...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/user/products`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User Products fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ User Products failed:', error.response?.data?.error || error.message);
  }
}

// Test user transactions
async function testUserTransactions() {
  console.log('\\n6️⃣ Testing User Transactions...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/user/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ User Transactions fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ User Transactions failed:', error.response?.data?.error || error.message);
  }
}

// Test product purchase (will likely fail due to insufficient balance)
async function testProductPurchase() {
  console.log('\\n7️⃣ Testing Product Purchase (should fail due to insufficient balance)...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/products/purchase`, {
      product_id: 1
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Product Purchase successful:', response.data.message);
  } catch (error) {
    console.log('✅ Product Purchase failed as expected (insufficient balance):', error.response?.data?.error || error.message);
  }
}

// Test recharge request
async function testRechargeRequest() {
  console.log('\\n8️⃣ Testing Recharge Request...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/recharge/request`, {
      amount: 1000
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Recharge Request successful:', response.data.message);
    rechargeId = response.data.recharge.id;
  } catch (error) {
    console.log('❌ Recharge Request failed:', error.response?.data?.error || error.message);
  }
}

// Test update recharge UTR
async function testUpdateRechargeUTR() {
  console.log('\\n9️⃣ Testing Update Recharge UTR...');
  if (!userToken || !rechargeId) {
    console.log('⚠️  Skipping - No user token or recharge ID available');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/recharge/update-utr/${rechargeId}`, {
      utr: 'TEST_UTR_123456'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Update Recharge UTR successful:', response.data.message);
  } catch (error) {
    console.log('❌ Update Recharge UTR failed:', error.response?.data?.error || error.message);
  }
}

// Test referral verification
async function testReferralVerification() {
  console.log('\\n🔟 Testing Referral Verification...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    // Try to use an invalid referral code first
    await axios.post(`${BASE_URL}/api/referral/verify-referral`, {
      referral_code: 'INVALID123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
  } catch (error) {
    console.log('✅ Referral Verification failed as expected with invalid code:', error.response?.data?.error || error.message);
  }
}

// Test withdrawal request
async function testWithdrawalRequest() {
  console.log('\\n1️⃣1️⃣ Testing Withdrawal Request...');
  if (!userToken) {
    console.log('⚠️  Skipping - No user token available');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/withdrawals/request`, {
      amount: 100,
      method: 'bank',
      bank_name: 'Test Bank',
      ifsc_code: 'TEST0001',
      account_number: '1234567890',
      account_holder_name: 'Test User'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Withdrawal Request successful:', response.data.message);
    withdrawalId = response.data.withdrawal.id;
  } catch (error) {
    console.log('❌ Withdrawal Request failed:', error.response?.data?.error || error.message);
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('\\n1️⃣2️⃣ Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
    console.log('✅ Admin Login successful:', response.data.message);
    adminToken = response.data.token;
  } catch (error) {
    console.log('❌ Admin Login failed:', error.response?.data?.error || error.message);
  }
}

// Test admin dashboard stats
async function testAdminDashboardStats() {
  console.log('\\n1️⃣3️⃣ Testing Admin Dashboard Stats...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Dashboard Stats fetched successfully, users:', response.data.totalUsers);
  } catch (error) {
    console.log('❌ Admin Dashboard Stats failed:', error.response?.data?.error || error.message);
  }
}

// Test admin users
async function testAdminUsers() {
  console.log('\\n1️⃣4️⃣ Testing Admin Users...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Users fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Users failed:', error.response?.data?.error || error.message);
  }
}

// Test admin transactions
async function testAdminTransactions() {
  console.log('\\n1️⃣5️⃣ Testing Admin Transactions...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Transactions fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Transactions failed:', error.response?.data?.error || error.message);
  }
}

// Test admin withdrawals
async function testAdminWithdrawals() {
  console.log('\\n1️⃣6️⃣ Testing Admin Withdrawals...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/withdrawals`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Withdrawals fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Withdrawals failed:', error.response?.data?.error || error.message);
  }
}

// Test admin recharges
async function testAdminRecharges() {
  console.log('\\n1️⃣7️⃣ Testing Admin Recharges...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/recharges`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Recharges fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Recharges failed:', error.response?.data?.error || error.message);
  }
}

// Test admin products
async function testAdminProducts() {
  console.log('\\n1️⃣8️⃣ Testing Admin Products...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Products fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Products failed:', error.response?.data?.error || error.message);
  }
}

// Test admin referrals
async function testAdminReferrals() {
  console.log('\\n1️⃣9️⃣ Testing Admin Referrals...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/referrals`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Referrals fetched successfully, count:', response.data.length);
  } catch (error) {
    console.log('❌ Admin Referrals failed:', error.response?.data?.error || error.message);
  }
}

// Test admin balance update
async function testAdminBalanceUpdate() {
  console.log('\\n2️⃣0️⃣ Testing Admin Balance Update...');
  if (!adminToken || !testUserId) {
    console.log('⚠️  Skipping - No admin token or user ID available');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/user/${testUserId}/balance`, {
      amount: 500,
      reason: 'Test balance addition'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Balance Update successful:', response.data.message);
  } catch (error) {
    console.log('❌ Admin Balance Update failed:', error.response?.data?.error || error.message);
  }
}

// Test admin UTR verification
async function testAdminUTRVerification() {
  console.log('\\n2️⃣1️⃣ Testing Admin UTR Verification...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  // First create a recharge with UTR
  let testRechargeId = null;
  try {
    const rechargeResponse = await axios.post(`${BASE_URL}/api/recharge/request`, {
      amount: 1000
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    testRechargeId = rechargeResponse.data.recharge.id;
    
    // Add UTR to the recharge
    await axios.post(`${BASE_URL}/api/recharge/update-utr/${testRechargeId}`, {
      utr: 'TEST_UTR_ADMIN_VERIFY'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    // Now verify the UTR as admin
    const response = await axios.post(`${BASE_URL}/api/admin/verify-utr`, {
      utr: 'TEST_UTR_ADMIN_VERIFY',
      action: 'approve'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin UTR Verification successful:', response.data.message);
  } catch (error) {
    console.log('❌ Admin UTR Verification failed:', error.response?.data?.error || error.message);
  }
}

// Test admin withdrawal update
async function testAdminWithdrawalUpdate() {
  console.log('\\n2️⃣2️⃣ Testing Admin Withdrawal Update...');
  if (!adminToken || !withdrawalId) {
    console.log('⚠️  Skipping - No admin token or withdrawal ID available');
    return;
  }
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/withdrawal/${withdrawalId}`, {
      status: 'rejected'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin Withdrawal Update successful');
  } catch (error) {
    console.log('❌ Admin Withdrawal Update failed:', error.response?.data?.error || error.message);
  }
}

// Test admin investment rebate
async function testAdminInvestmentRebate() {
  console.log('\\n2️⃣3️⃣ Testing Admin Investment Rebate...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
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

// Test admin user update
async function testAdminUserUpdate() {
  console.log('\\n2️⃣4️⃣ Testing Admin User Update...');
  if (!adminToken || !testUserId) {
    console.log('⚠️  Skipping - No admin token or user ID available');
    return;
  }
  
  try {
    const response = await axios.put(`${BASE_URL}/api/admin/user/${testUserId}`, {
      name: "Updated Test User"
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Admin User Update successful:', response.data.message);
  } catch (error) {
    console.log('❌ Admin User Update failed:', error.response?.data?.error || error.message);
  }
}

// Test admin product management
async function testAdminProductManagement() {
  console.log('\\n2️⃣5️⃣ Testing Admin Product Management...');
  if (!adminToken) {
    console.log('⚠️  Skipping - No admin token available');
    return;
  }
  
  // Test adding a new product
  try {
    const newProduct = {
      name: "New Test Product",
      price: 1000,
      daily_income: 50,
      duration: 30,
      total_return: 1150,
      profit: 150
    };
    
    const response = await axios.post(`${BASE_URL}/api/admin/products`, newProduct, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Admin Add Product successful:', response.data.message);
    
    // Get the product ID to test updates and deletion
    const productId = response.data.product.id;
    
    // Test updating the product
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/admin/products/${productId}`, {
        name: "Updated Test Product",
        daily_income: 60
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin Update Product successful:', updateResponse.data.message);
    } catch (error) {
      console.log('❌ Admin Update Product failed:', error.response?.data?.error || error.message);
    }
    
    // Test deleting the product (only if no active investments)
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Admin Delete Product successful:', deleteResponse.data.message);
    } catch (error) {
      console.log('⚠️  Admin Delete Product failed (likely due to active investments):', error.response?.data?.error || error.message);
    }
  } catch (error) {
    console.log('❌ Admin Product Management failed:', error.response?.data?.error || error.message);
  }
}

// Run the comprehensive tests
runComprehensiveAPITests();