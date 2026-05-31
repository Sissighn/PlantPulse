const model = require("../config/gemini");

const PLANT_CARE_SAFETY_RULES = `
  Safety and quality rules:
  - Do not give guaranteed diagnoses. Phrase plant diseases, pests, and deficiencies as plausible observations, not certainties.
  - Briefly name uncertainty when the image, description, or symptoms are ambiguous.
  - For image analysis: describe only visible signs and derive possible causes from them. Make clear that a photo cannot fully replace context such as location, soil, roots, smell, and symptom history.
  - If toxicity, children, pets, or ingestion are involved: answer cautiously, do not guarantee safety, and advise checking reliable sources. If symptoms are present, recommend contacting a veterinarian, poison control center, or medical professional immediately.
  - Do not recommend harsh chemicals or pesticides without mentioning gentler alternatives, protective measures, and label/manufacturer instructions.
  - Reply in the user's language when it is recognizable.
`;

// --- AI Tips ---
// Fetches concise care tips (water, light, fertilizer) for a specific plant and season.
exports.getCareTips = async (plantName, season) => {
  if (!model) return "KI nicht konfiguriert.";
  try {
    const prompt = `
      You are an enthusiastic, modern plant-care buddy.
      Give me 3 ultra-short, practical care tips for "${plantName}" in "${season}".
      ${PLANT_CARE_SAFETY_RULES}
      Reply EXACTLY in this format, with no intro sentence and no Markdown emphasis:
      • Gießen: [Tipp]
      • Licht: [Tipp]
      • Dünger: [Tipp]
      Keep it short, friendly, and motivating. If the user's language is German, use informal "du".
      If toxicity or pets could be relevant, mention it briefly in the most fitting tip.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Konnte keine Tipps generieren.";
  }
};

// Asks the AI to suggest a watering interval in days for a given plant name.
exports.suggestInterval = async (plantName) => {
  if (!model) return null;
  try {
    const result = await model.generateContent(
      `Estimate a cautious watering interval for the indoor plant "${plantName}" in days.
       Treat it only as a starting point because location, pot size, soil, and season can vary.
       Reply ONLY with one integer between 1 and 365.`
    );
    const number = parseInt(result.response.text().replace(/[^0-9]/g, ""));
    return Number.isFinite(number) && number >= 1 && number <= 365 ? number : 7;
  } catch (error) {
    return 7;
  }
};

// Converts a file buffer into a Google Generative AI-compatible part.
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

// --- Chat Bot ---
// Handles the main chat logic, supporting both text and image-based queries.
exports.chatWithBot = async (userMessage, imageFile, history = []) => {
  if (!model) return "Verbindung unterbrochen! 🔌";

  try {
    const systemPrompt = `
      You are "SproutBot", a small, friendly pixel robot with a green sprout on its head.
      You live inside a plant-care app.
      
      Rules:
      1. Always answer briefly, helpfully, warmly, and with charm, but avoid being cheesy.
      2. You are a plant expert, but explain simply and avoid jargon.
      3. If the user says hello, briefly introduce yourself as SproutBot.
      4. Use plant emojis sparingly.
      5. If an IMAGE is provided: analyze visible signs on leaves, stems, soil, and pot. Look for possible pests, brown spots, yellow leaves, dryness, overwatering, or light stress.
      6. Start with the most likely causes, then give 2-4 concrete next steps.
      ${PLANT_CARE_SAFETY_RULES}
    `;

    if (imageFile) {
      const imagePart = fileToGenerativePart(
        imageFile.buffer,
        imageFile.mimetype
      );

      const promptParts = [
        systemPrompt,
        `Conversation history: ${history.map((h) => h.parts[0].text).join(" | ")}`,
        `User question about the image: "${userMessage}"`,
        imagePart,
      ];

      const result = await model.generateContent(promptParts);
      return result.response.text();
    } else {
      const promptParts = [
        systemPrompt,
        `Conversation history: ${history.map((h) => h.parts[0].text).join(" | ")}`,
        `User question: "${userMessage}"`,
      ];

      const result = await model.generateContent(promptParts);
      return result.response.text();
    }
  } catch (error) {
    console.error("AI Fehler:", error.message);
    if (error.message.includes("429"))
      return "Zu viele Anfragen ⏳ Warte kurz.";
    return "Fehler im System 🤖";
  }
};
