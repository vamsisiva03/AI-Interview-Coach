require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1' });
  
  let report = "Test Result Log\n==============\n";
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    report += "SUCCESS (gemini-flash-latest): " + response.text() + "\n";
  } catch (error) {
    report += "FAILED with gemini-flash-latest\n";
    report += error.message + "\n";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    report += "SUCCESS (gemini-2.5-flash): " + response.text() + "\n";
  } catch (error) {
    report += "FAILED with gemini-2.5-flash\n";
    report += error.message + "\n";
  }

  fs.writeFileSync('test_report.txt', report);
  console.log("Report written to test_report.txt");
}

test();
