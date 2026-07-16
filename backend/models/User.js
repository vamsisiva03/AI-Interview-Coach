const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional: only for email/password users
  provider: { type: String, default: 'local' },
  providerId: { type: String }, // Optional: only for OAuth users
  profileImage: { type: String },
  bio: { type: String, default: '' },
  notifications: {
    emailUpdates: { type: Boolean, default: true },
    browserAlerts: { type: Boolean, default: false },
    weeklyReport: { type: Boolean, default: true }
  },
  privacy: { type: String, default: 'Private' },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
