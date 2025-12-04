const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

let model = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} else {
  console.warn(
    "⚠️  Warnung: Kein GEMINI_API_KEY gefunden. KI-Features sind deaktiviert."
  );
}

module.exports = model;
