const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function generateQuestion(domain, previousQuestions = []) {
  const previousContext = previousQuestions.length > 0 
    ? `Previous questions asked: ${previousQuestions.join('; ')}.` 
    : '';

  const prompt = `
  You are an expert technical interviewer.
  Generate exactly 1 deep, practical, and challenging technical interview question for the domain: "${domain}".
  ${previousContext}
  Make sure this new question is completely different from previous questions.
  Return only the question text, no preamble or extra conversational text.
  `;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemini-pro",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Interview Coach"
      }
    });
    
    console.log("SUCCESS:", response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error("ERROR DATA:", JSON.stringify(error?.response?.data || error.message, null, 2));
  }
}

generateQuestion("React Developer");
