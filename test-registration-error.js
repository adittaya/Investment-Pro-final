const axios = require('axios');

async function testRegistrationError() {
  console.log('Testing registration error...');

  // Test with a new unique username each time
  const testUser = {
    name: "Test User",
    username: `testuser${Date.now()}`,
    phone_number: `987654321${Date.now() % 10}`, // Make sure phone number is unique
    password: "password123",
    confirm_password: "password123"
  };

  try {
    console.log('Attempting to register with data:', testUser);
    const response = await axios.post('http://localhost:3000/api/auth/register', testUser);
    console.log('✅ Registration successful:', response.data.message);
  } catch (error) {
    console.log('❌ Registration failed with error:', error.response?.data?.error || error.message);
    console.log('Full error response:', error.response?.data);
  }
}

testRegistrationError();