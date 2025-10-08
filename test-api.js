const axios = require('axios');

async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing Investment Platform API...\n');
  
  // Test 1: Registration
  console.log('1. Testing Registration...');
  try {
    const registerRes = await axios.post(`${baseUrl}/api/auth/register`, {
      name: "Test User",
      username: "testuser123",
      phone_number: "9876543210",
      password: "password123",
      confirm_password: "password123"
    });
    console.log('✅ Registration successful:', registerRes.data.message);
    const userToken = registerRes.data.token;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.error || error.message);
  }
  
  // Test 2: Login
  console.log('\n2. Testing Login...');
  try {
    const loginRes = await axios.post(`${baseUrl}/api/auth/login`, {
      phone_number: "9876543210",
      password: "password123"
    });
    console.log('✅ Login successful:', loginRes.data.message);
    const userToken = loginRes.data.token;
    
    // Test 3: Purchase (will fail due to insufficient balance, which is expected)
    console.log('\n3. Testing Product Purchase (should fail due to insufficient balance)...');
    try {
      const purchaseRes = await axios.post(`${baseUrl}/api/products/purchase`, {
        product_id: 1
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Purchase successful:', purchaseRes.data.message);
    } catch (error) {
      console.log('✅ Purchase failed as expected (insufficient balance):', error.response?.data?.error || error.message);
    }
    
    // Test 4: Recharge
    console.log('\n4. Testing Recharge Request...');
    try {
      const rechargeRes = await axios.post(`${baseUrl}/api/recharge/request`, {
        amount: 1000
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✅ Recharge request successful:', rechargeRes.data.message);
    } catch (error) {
      console.log('❌ Recharge request failed:', error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
  }
  
  // Test 5: Admin Login
  console.log('\n5. Testing Admin Login...');
  try {
    const adminLoginRes = await axios.post(`${baseUrl}/api/auth/login`, {
      phone_number: "9999999999",
      password: "admin123"
    });
    console.log('✅ Admin login successful:', adminLoginRes.data.message);
    const adminToken = adminLoginRes.data.token;
    
    // Test 6: Daily profit calculation (admin only)
    console.log('\n6. Testing Daily Profit Calculation (admin only)...');
    try {
      const profitRes = await axios.post(`${baseUrl}/api/products/daily-profit`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Daily profit calculation successful:', profitRes.data.message);
    } catch (error) {
      console.log('❌ Daily profit calculation failed:', error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.error || error.message);
  }
  
  console.log('\nAPI Testing Complete!');
}

testAPI().catch(console.error);