const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  questionsCount: {
    type: Number,
    required: true,
    default: 0
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: Number, // in seconds
    required: true,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  evaluations: {
    type: Array,
    default: []
  },
  questions: {
    type: Array,
    default: []
  }
}, {
  timestamps: true // ✅ optional but recommended
});

module.exports = mongoose.model('Interview', interviewSchema);