const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

async function callAICompletions(prompt, apiKey) {
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_openrouter_api_key") {
    const err = new Error("Unauthorized: AI API Key is missing or misconfigured (401)");
    err.status = 401;
    throw err;
  }

  // 1. If key is OpenRouter API Key
  if (apiKey.startsWith("sk-or-")) {
    try {
      const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }]
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
          "X-Title": "AI Interview Coach"
        },
        timeout: 25000 // 25s timeout
      });

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error("Invalid response format from OpenRouter completions");
    } catch (error) {
      const err = new Error();
      if (error.response) {
        err.status = error.response.status;
        if (error.response.status === 401) {
          err.message = "Unauthorized: Invalid OpenRouter API Key (401)";
        } else if (error.response.status === 429) {
          err.message = "Rate limit exceeded: Too many requests to the AI engine (429)";
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

  // 2. If key is Google API Key (fallback using native SDK)
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[aiEvaluator] callAICompletions Google SDK fallback failed:", error);
    const err = new Error();
    const errMsg = error.message || "";
    if (errMsg.includes("API key not valid") || errMsg.includes("401") || errMsg.includes("Key not found")) {
      err.status = 401;
      err.message = "Unauthorized: Invalid Gemini API key (401)";
    } else if (errMsg.includes("429") || errMsg.includes("Quota exceeded") || errMsg.includes("ResourceExhausted")) {
      err.status = 429;
      err.message = "Rate limit exceeded: Gemini quota limits reached (429)";
    } else {
      err.status = 500;
      err.message = `Gemini Generation Error: ${errMsg}`;
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
    let text = await callAICompletions(prompt, apiKey);
    
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
      const arrayMatch = text.match(/\[.*\]/s);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch (e2) {}
      }
      return [text];
    }
  } catch (error) {
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
    let text = await callAICompletions(prompt, apiKey);
    
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error("Evaluation response parsing failed");
    }
  } catch (error) {
    throw new Error(error.message || "Failed to evaluate answer");
  }
}

module.exports = { generateQuestions, evaluateAnswer };