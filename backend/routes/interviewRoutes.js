const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { generateQuestions, evaluateAnswer } = require("../controllers/aiEvaluator");
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");

let sessions = {};

// Start Interview
router.post("/start-interview", authMiddleware, (req, res) => {
  console.log("[interviewRoutes] POST /start-interview - Body:", req.body);
  const { domain, difficulty = "Beginner" } = req.body;
  if (!domain) {
    console.warn("[interviewRoutes] Start Interview failed: missing domain");
    return res.status(400).json({ error: "Domain is required" });
  }

  const sessionId = uuidv4();
  sessions[sessionId] = {
    userId: req.user.id,
    domain: domain,
    difficulty: difficulty,
    questions: [],
    scores: []
  };

  console.log("[interviewRoutes] Session created:", sessionId);
  res.json({ sessionId, domain, difficulty });
});

// Generate Multiple Questions
router.post("/generate-questions", authMiddleware, async (req, res) => {
  console.log("[interviewRoutes] POST /generate-questions - Body:", req.body);
  const { sessionId, count = 10 } = req.body;

  if (!sessionId || !sessions[sessionId] || sessions[sessionId].userId !== req.user.id) {
    console.warn("[interviewRoutes] Generate Questions failed: invalid or unauthorized session", sessionId);
    return res.status(404).json({ error: "Session not found or missing sessionId" });
  }

  const session = sessions[sessionId];
  const { domain, difficulty } = session;

  try {
    console.log("[interviewRoutes] Calling generateQuestions for domain:", domain);
    // Pass existing questions to ensure AI doesn't duplicate them
    const newQuestions = await generateQuestions(domain, session.questions, difficulty, count);
    session.questions = [...session.questions, ...newQuestions];
    
    console.log("[interviewRoutes] Successfully generated", newQuestions.length, "questions");
    res.json({ success: true, questions: session.questions });
  } catch (error) {
    console.error("[interviewRoutes] Error in /generate-questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate questions" });
  }
});

// Single Question (Legacy Support if needed, but updated to use new controller)
router.post("/generate-question", authMiddleware, async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId || !sessions[sessionId] || sessions[sessionId].userId !== req.user.id) {
    return res.status(404).json({ error: "Session not found or missing sessionId" });
  }

  const session = sessions[sessionId];
  const { domain, difficulty, questions: previousQuestions } = session;

  try {
    const questionArray = await generateQuestions(domain, previousQuestions, difficulty, 1);
    const question = questionArray[0];
    session.questions.push(question);
    
    res.json({ question });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// Evaluate Answer
router.post("/evaluate-answer", authMiddleware, async (req, res) => {
  const { sessionId, question, answer } = req.body;

  if (!sessionId || !sessions[sessionId] || sessions[sessionId].userId !== req.user.id) {
    return res.status(404).json({ error: "Session not found or missing sessionId" });
  }

  if (!question || !answer) {
    return res.status(400).json({ error: "Question and answer are required" });
  }

  try {
    const evaluationResult = await evaluateAnswer(question, answer);
    sessions[sessionId].scores.push(evaluationResult);
    
    // We already have structured data, pass it back clearly
    res.json(evaluationResult);
  } catch (error) {
    console.error("[interviewRoutes] Failed to evaluate answer:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate answer" });
  }
});

// Interview Report
router.get("/report/:sessionId", authMiddleware, (req, res) => {
  const sessionId = req.params.sessionId;

  if (!sessions[sessionId] || sessions[sessionId].userId !== req.user.id) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json({
    domain: sessions[sessionId].domain,
    questionsAsked: sessions[sessionId].questions.length,
    evaluations: sessions[sessionId].scores,
    questions: sessions[sessionId].questions
  });
});

// GET Interview History (Per User)
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await Interview.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error("[interviewRoutes] History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch interview history" });
  }
});

// SAVE Interview Report (To MongoDB)
// GET Interview Stats (Per User)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const history = await Interview.find({ userId: req.user.id }).sort({ date: -1 });
    
    const totalInterviews = history.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews) 
      : 0;
    
    const recentInterviews = history.slice(0, 5); 
    
    res.json({
      totalInterviews,
      averageScore,
      recentInterviews
    });
  } catch (error) {
    console.error("[interviewRoutes] Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch interview stats" });
  }
});

router.post("/save-report", authMiddleware, async (req, res) => {
  const { sessionId, duration, score, evaluations, questions } = req.body;

  if (!sessionId || !sessions[sessionId] || sessions[sessionId].userId !== req.user.id) {
    return res.status(404).json({ error: "Session not found or unauthorized" });
  }

  try {
    const session = sessions[sessionId];
    
    // Check if session already saved
    const existing = await Interview.findOne({ sessionId });
    if (existing) {
      return res.json({ success: true, message: "Already saved", interview: existing });
    }

    const newInterview = new Interview({
      userId: req.user.id,
      sessionId,
      domain: session.domain,
      difficulty: session.difficulty,
      questionsCount: questions?.length || session.questions.length,
      score: score,
      duration: duration,
      evaluations: evaluations || session.scores,
      questions: questions || session.questions,
      date: new Date()
    });

    await newInterview.save();
    
    // Optional: clean up in-memory session
    // delete sessions[sessionId];

    res.json({ success: true, interview: newInterview });
  } catch (error) {
    console.error("[interviewRoutes] Save report error:", error);
    res.status(500).json({ error: "Failed to save interview report" });
  }
});

module.exports = router;