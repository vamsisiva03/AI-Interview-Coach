const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");

// @route   GET /api/dashboard
// @desc    Get dashboard metrics for logged-in user
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch interviews for the user, sorted by date DESC
    const interviews = await Interview.find({ userId }).sort({ date: -1 });

    if (!interviews || interviews.length === 0) {
      return res.json({
        interviewsCompleted: 0,
        averagePerformance: 0,
        totalPractice: 0,
        aiConfidence: 0,
        recentInterviews: []
      });
    }

    const interviewsCompleted = interviews.length;

    // Calculate performance stats
    const totalScore = interviews.reduce((sum, i) => sum + (Number(i.score) || 0), 0);
    const averagePerformance = Math.round(totalScore / interviewsCompleted);

    // Calculate practice time stats
    const totalPractice = interviews.reduce((sum, i) => sum + (Number(i.duration) || 0), 0);

    // AI Confidence Logic (Base score + offset or percentage)
    const aiConfidence = Math.min(100, Math.round(averagePerformance * 0.9));

    // Map recent interviews for the frontend
    const recentInterviews = interviews.slice(0, 5).map(i => ({
      sessionId: i.sessionId,
      domain: i.domain,
      score: i.score,
      date: i.date,
      questionsCount: i.questionsCount || (i.questions ? i.questions.length : 0)
    }));

    res.json({
      interviewsCompleted,
      averagePerformance,
      totalPractice,
      aiConfidence,
      recentInterviews
    });

  } catch (error) {
    console.error("[dashboardRoutes] Error:", error.message);

    res.status(200).json({
      interviewsCompleted: 0,
      averagePerformance: 0,
      totalPractice: 0,
      aiConfidence: 0,
      recentInterviews: []
    });
  }
});

module.exports = router;
