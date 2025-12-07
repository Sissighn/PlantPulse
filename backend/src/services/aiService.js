const model = require("../config/gemini");

// --- AI Tips ---
// Fetches concise care tips (water, light, fertilizer) for a specific plant and season.
exports.getCareTips = async (plantName, season) => {
  if (!model) return "KI nicht konfiguriert.";
  try {
    const prompt = `
      Du bist ein begeisterter, moderner Pflanzen-Buddy. 
      Gib mir 3 ultra-kurze, knackige Pflege-Tipps für "${plantName}" im "${season}".
      Antworte GENAU in diesem Format (keine Einleitungssätze, kein Markdown/**):
      • Gießen: [Tipp]
      • Licht: [Tipp]
      • Dünger: [Tipp]
      Halte dich kurz. Duz-Form. Motivierender Ton.
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
      `Gießintervall für "${plantName}" in Tagen? Antworte NUR mit der Zahl.`
    );
    const number = parseInt(result.response.text().replace(/[^0-9]/g, ""));
    return isNaN(number) ? 7 : number;
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
      Du bist "SproutBot", ein kleiner, freundlicher Pixel-Roboter mit einem grünen Pflänzchen auf dem Kopf. 🌱🤖
      Du lebst in einer Pflanzen-App.
      
      Regeln:
      1. Antworte immer kurz, hilfreich und charmant und lieb, aber nicht kitschig!
      2. Du bist Pflanzen-Experte, erklärst aber einfach (kein Fachchinesisch).
      3. Wenn der User "Hallo" sagt, stell dich kurz als SproutBot vor.
      4. Nutze Pflanzen-Emojis, aber übertreibe es nicht.
      5. Wenn ein BILD dabei ist: Analysiere Blätter, Erde und Tofp genau. Suche nach Schädlingen, braunen Stellen oder Trockenheit.
    `;

    if (imageFile) {
      const imagePart = fileToGenerativePart(
        imageFile.buffer,
        imageFile.mimetype
      );

      const promptParts = [
        systemPrompt,
        `Verlauf: ${history.map((h) => h.parts[0].text).join(" | ")}`,
        `User Frage zum Bild: "${userMessage}"`,
        imagePart,
      ];

      const result = await model.generateContent(promptParts);
      return result.response.text();
    } else {
      const promptParts = [
        systemPrompt,
        `Verlauf: ${history.map((h) => h.parts[0].text).join(" | ")}`,
        `User Frage: "${userMessage}"`,
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
