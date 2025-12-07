const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;

let smartModel = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const primaryModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const secondaryModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const emergencyModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite-preview-02-05",
  });

  smartModel = {
    generateContent: async (...args) => {
      try {
        return await primaryModel.generateContent(...args);
      } catch (error) {
        const status = error.response?.status || error.status;
        const msg = error.message || "";

        const isQuota = status === 429 || msg.includes("429");
        const isServerIssue = status === 503 || status === 500;
        const isNotFound = status === 404;

        if (isQuota || isServerIssue || isNotFound) {
          console.warn(
            `⚠️ Primary (2.5) Limit/Fehler (${status}). Wechsele zu Fallback (2.0-flash)... 🛡️`
          );

          try {
            return await secondaryModel.generateContent(...args);
          } catch (err2) {
            const status2 = err2.response?.status || err2.status;
            console.warn(
              `⚠️ Secondary (2.0) auch fehlerhaft (${status2}). Versuche NOTFALL-Modell (Lite)... 🚨`
            );

            return await emergencyModel.generateContent(...args);
          }
        }

        throw error;
      }
    },
  };

  console.log("🤖 Smart-AI initialisiert: 2.5 -> 2.0 -> Lite");
} else {
  console.warn("⚠️ Warning: No GEMINI_API_KEY found.");
}

module.exports = smartModel;
