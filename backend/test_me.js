const axios = require('axios');

async function testMe() {
  try {
    console.log(`Testing /api/auth/me`);
    const res = await axios.get('http://localhost:5000/api/auth/me');
    console.log('Me response:', res.data);
  } catch (err) {
    console.error('Error during test:', err.response?.data || err.message);
  }
}

testMe();
