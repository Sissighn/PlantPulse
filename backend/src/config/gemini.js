const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

let model = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} else {
  console.warn(
    "⚠️  Warning: No GEMINI_API_KEY found. AI features are disabled."
  );
}

module.exports = model;
