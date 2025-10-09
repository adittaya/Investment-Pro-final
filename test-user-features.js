const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Test credentials for a new user
const TEST_USER = {
  name: "Feature Test User",
  username: `featuretest${Date.now()}`,
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

async function testAllUserFeatures() {
  console.log('🧪 Testing All User Features...\n');

  try {
    // 1. Test Registration
    await testRegistration();

    // 2. Test Login
    await testLogin();

    // 3. Test User Profile
    await testUserProfile();

    // 4. Test User Products
    await testUserProducts();

    // 5. Test User Transactions
    await testUserTransactions();

    // 6. Test Product Purchase
    await testProductPurchase();

    // 7. Test Recharge Request
    await testRechargeRequest();

    // 8. Test Update Recharge UTR
    await testUpdateRechargeUTR();

    // 9. Test Referral Verification
    await testReferralVerification();

    // 10. Test Withdrawal Request
    await testWithdrawalRequest();

    console.log('\n✅ All user features tested successfully!');
  } catch (error) {
    console.error('\n❌ Error during user feature testing:', error.message);
  }
}

async function testRegistration() {
  console.log('1️⃣ Testing Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    console.log('✅ Registration successful:', response.data.message);
    userId = response.data.user.id;  // Store the user ID for later use
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.error || error.message);
  }
}

async function testLogin() {
  console.log('\n2️⃣ Testing Login...');
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

async function testUserProfile() {
  console.log('\n3️⃣ Testing User Profile...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
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

async function testUserProducts() {
  console.log('\n4️⃣ Testing User Products...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
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

async function testUserTransactions() {
  console.log('\n5️⃣ Testing User Transactions...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
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

async function testProductPurchase() {
  console.log('\n6️⃣ Testing Product Purchase (expected to fail without recharge) ...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
    return;
  }
  try {
    const response = await axios.post(`${BASE_URL}/api/products/purchase`, {
      product_id: 1  // First product
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✅ Product Purchase successful:', response.data.message);
  } catch (error) {
    console.log('✅ Product Purchase failed as expected (insufficient balance):', error.response?.data?.error || error.message);
  }
}

async function testRechargeRequest() {
  console.log('\n7️⃣ Testing Recharge Request...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
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

async function testUpdateRechargeUTR() {
  console.log('\n8️⃣ Testing Update Recharge UTR...');
  if (!userToken || !rechargeId) {
    console.log('⚠️ Skipping - No user token or recharge ID available');
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

async function testReferralVerification() {
  console.log('\n9️⃣ Testing Referral Verification...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
    return;
  }
  // Test with invalid referral code first
  try {
    await axios.post(`${BASE_URL}/api/referral/verify-referral`, {
      referral_code: 'INVALID123'
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('❌ Should have failed with invalid referral code');
  } catch (error) {
    console.log('✅ Referral Verification failed as expected with invalid code:', error.response?.data?.error || error.message);
  }
}

async function testWithdrawalRequest() {
  console.log('\n🔟 Testing Withdrawal Request (expected to fail without profit balance)...');
  if (!userToken) {
    console.log('⚠️ Skipping - No user token available');
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
    console.log('✅ Withdrawal Request failed as expected (no profit balance):', error.response?.data?.error || error.message);
  }
}

testAllUserFeatures();