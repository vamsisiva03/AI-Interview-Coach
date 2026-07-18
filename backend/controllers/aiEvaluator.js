const axios = require("axios");

async function callAICompletions(prompt, apiKey, maxTokens = 1000, temperature = 0.7) {
  const finalMaxTokens = Math.min(maxTokens, 1000);

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_openrouter_api_key") {
    console.error("[aiEvaluator] API Key missing or misconfigured");
    const err = new Error("Unauthorized: AI API Key is missing or misconfigured (401)");
    err.status = 401;
    throw err;
  }

  try {
    const requestBody = {
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324",
      messages: [{ role: "user", content: prompt }],
      max_tokens: finalMaxTokens,
      temperature: temperature
    };

    console.log("========== OPENROUTER DEBUG ==========");
    console.log("Model:", requestBody.model);
    console.log("Max Tokens:", finalMaxTokens);
    console.log("Temperature:", temperature);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("======================================");

    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", requestBody, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 25000 // 25s timeout
    });

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error("Invalid response format from OpenRouter completions");
  } catch (error) {
    console.error("[aiEvaluator] callAICompletions OpenRouter API failed:", error);
    const err = new Error();
    if (error.response) {
      err.status = error.response.status;
      if (error.response.status === 401) {
        err.message = "Unauthorized: Invalid OpenRouter API Key (401)";
      } else if (error.response.status === 429) {
        err.message = "Rate limit exceeded: OpenRouter quota limits reached (429)";
      } else {
        err.message = `AI Engine Error (${error.response.status}): ${error.response.data?.error?.message || error.message}`;
      }
    } else {
      err.status = 500;
      err.message = `Network/Connection failure with AI Engine: ${error.message}`;
    }
    throw err;
  }
}

async function generateQuestions(domain, previousQuestions = [], difficulty = "Beginner", count = 10, resumeText = "") {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const previousContext = previousQuestions.length > 0
    ? `Previous questions asked: ${previousQuestions.join('; ')}.`
    : '';

  let difficultyInstruction = "";
  if (difficulty === "Beginner") {
    difficultyInstruction = "Focus on basic concepts and theory-based questions.";
  } else if (difficulty === "Intermediate") {
    difficultyInstruction = "Focus on a concept and ask for a practical example.";
  } else if (difficulty === "Advanced") {
    difficultyInstruction = "Focus on system design, architecture, and scaling questions.";
  }

  const prompt = `
  You are an expert technical interviewer.
  Generate exactly ${count} deep, practical, and challenging technical interview questions for the domain: "${domain}" at a "${difficulty}" level.
  ${difficultyInstruction}
  ${resumeText ? `Candidate Resume Context: ${resumeText}` : ""}
  ${previousContext}
  
  Return the questions as a JSON array of strings. 
  Example format: ["Question 1", "Question 2"]
  Return ONLY the JSON array, no preamble, no markdown formatting, just pure JSON.
  `;

  try {
    let text = await callAICompletions(prompt, apiKey, 800, 0.7);

    // Clean up possible markdown
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const questions = JSON.parse(text);
      if (Array.isArray(questions)) {
        return questions;
      } else if (questions.questions && Array.isArray(questions.questions)) {
        return questions.questions;
      }
      return [text];
    } catch (e) {
      console.error("[aiEvaluator] Failed to parse generated questions as JSON:", text);
      const arrayMatch = text.match(/\[.*\]/s);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e2) {
          console.error("[aiEvaluator] Regex fallback parsing also failed:", e2);
        }
      }
      return [text];
    }
  } catch (error) {
    console.error("[aiEvaluator] generateQuestions error:", error.message);
    throw new Error(error.message || "Failed to generate questions");
  }
}

async function evaluateAnswer(question, answer) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const prompt = `
  You are an expert technical interviewer evaluating a candidate's answer.
  
  Question asked:
  ${question}
  
  Candidate's Answer:
  ${answer}
  
  Evaluate the answer completely. Return a JSON object with EXACTLY this structure, nothing else:
  {
    "score": "A number out of 10",
    "strengths": ["list of 1-3 strong points"],
    "improvements": ["list of 1-3 areas for improvement"]
  }
  
  Return ONLY valid JSON.
  `;

  try {
    let text = await callAICompletions(prompt, apiKey, 500, 0.7);

    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("[aiEvaluator] Failed to parse evaluation response as JSON:", text);
      throw new Error("Evaluation response parsing failed");
    }
  } catch (error) {
    console.error("[aiEvaluator] evaluateAnswer error:", error.message);
    throw new Error(error.message || "Failed to evaluate answer");
  }
}

module.exports = { generateQuestions, evaluateAnswer };