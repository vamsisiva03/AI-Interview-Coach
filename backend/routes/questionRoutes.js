const express = require("express");
const router = express.Router();


// Generate Question
router.post("/generate-question", async (req, res) => {

  const { domain } = req.body;

  console.log("Domain received:", domain);

  const question = `Explain the core concepts of ${domain}. Give practical examples.`;

  res.json({
    question: question
  });

});


// Evaluate Answer
router.post("/evaluate-answer", async (req, res) => {

  const { question, answer } = req.body;

  console.log("Evaluating answer...");

  const result = `
Score: 7/10

Strengths:
• Good understanding of the concept
• Clear explanation

Improvements:
• Provide real-world examples
• Explain with more depth
`;

  res.json({
    result: result
  });

});

module.exports = router;