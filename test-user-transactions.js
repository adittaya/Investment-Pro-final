const axios = require('axios');

async function testUserTransactions() {
  console.log('Testing user transactions endpoint...');

  // First login
  try {
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      phone_number: '9876543218',
      password: 'password123'
    });
    
    console.log('Login successful');
    const token = loginResponse.data.token;
    
    // Now test user transactions
    const response = await axios.get('http://localhost:3000/api/user/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ User transactions endpoint working, count:', response.data.length);
  } catch (error) {
    console.log('❌ User transactions failed:', error.response?.data?.error || error.message);
  }
}

testUserTransactions();