require("dotenv").config();
const { generateQuestions } = require("./controllers/aiEvaluator");

async function test() {
  console.log("Starting AI Generation Test...");
  console.log("Using API Key:", process.env.OPENROUTER_API_KEY ? "FOUND" : "NOT FOUND");
  
  try {
    const questions = await generateQuestions("Software Engineer", [], "Intermediate", 3);
    console.log("SUCCESS! Questions generated:");
    console.log(JSON.stringify(questions, null, 2));
  } catch (error) {
    console.error("TEST FAILED!");
    console.error(error);
  }
}

test();
