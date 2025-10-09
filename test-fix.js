const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:3000';

// Test credentials for a new user
const TEST_USER = {
  name: "Fix Test User",
  username: `fixtest${Date.now()}`,
  phone_number: `987654321${Date.now() % 10}`,
  password: "password123",
  confirm_password: "password123"
};

async function testFix() {
  console.log('🔍 Testing the recharge_balance fix...\n');

  try {
    // 1. Register new user
    console.log('1️⃣ Registering new user...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    console.log('✅ Registration successful');
    const userId = registerResponse.data.user.id;
    
    // 2. Login
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      phone_number: TEST_USER.phone_number,
      password: TEST_USER.password
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 3. Check user profile to verify recharge_balance is 0
    console.log('\n3️⃣ Checking user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User profile fetched');
    console.log('   - balance:', profileResponse.data.balance);
    console.log('   - recharge_balance:', profileResponse.data.recharge_balance);
    
    // 4. Try to purchase a product (should fail due to insufficient balance)
    console.log('\n4️⃣ Attempting product purchase (should fail)...');
    try {
      const purchaseResponse = await axios.post(`${BASE_URL}/api/products/purchase`, {
        product_id: 1  // First product
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Product purchase unexpectedly succeeded:', purchaseResponse.data.message);
    } catch (error) {
      console.log('✅ Product purchase correctly failed:', error.response?.data?.error || error.message);
    }
    
    // 5. Make a recharge
    console.log('\n5️⃣ Making a recharge...');
    const rechargeResponse = await axios.post(`${BASE_URL}/api/recharge/request`, {
      amount: 1000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Recharge request successful:', rechargeResponse.data.message);
    const rechargeId = rechargeResponse.data.recharge.id;
    
    // 6. Update UTR as user (in real scenario, user would submit UTR after making payment)
    console.log('\n6️⃣ Updating UTR (simulating payment confirmation)...');
    const utrUpdateResponse = await axios.post(`${BASE_URL}/api/recharge/update-utr/${rechargeId}`, {
      utr: 'TEST_UTR_VERIFY_FIX'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ UTR update successful:', utrUpdateResponse.data.message);
    
    console.log('\n✅ Fix verification test completed!');
    console.log('\nFor complete testing with admin verification, you would need an admin to approve the UTR.');
    console.log('After admin approval, the recharge_balance would increase and product purchase would be possible.');
  } catch (error) {
    console.error('\n❌ Error during fix testing:', error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
}

testFix();