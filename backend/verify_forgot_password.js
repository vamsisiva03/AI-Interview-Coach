const axios = require('axios');
const mongoose = require('mongoose');

async function testForgotPassword() {
  try {
    const email = 'kavetivamsisiva5@gmail.com';
    console.log(`Testing forgot-password for: ${email}`);
    
    const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
    console.log('Forgot password response:', res.data);

    // Now let's find the token in the database (since we're using Ethereal/mock)
    await mongoose.connect('mongodb://127.0.0.1:27017/ai-interview-coach');
    const User = require('./models/User');
    const user = await User.findOne({ email });
    
    if (user && user.resetPasswordToken) {
      console.log('Found reset token in DB:', user.resetPasswordToken);
      console.log('Token expiry:', user.resetPasswordExpire);
    } else {
      console.error('Reset token not found in DB!');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during test:', err.response?.data || err.message);
    process.exit(1);
  }
}

testForgotPassword();
