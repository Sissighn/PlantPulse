const model = require("../config/gemini");

exports.getCareTips = async (plantName, season) => {
  if (!model) return "KI nicht konfiguriert.";

  try {
    const prompt = `Du bist ein Gärtner. Gib mir 3 kurze Pflege-Tipps (Gießen, Licht, Dünger) für "${plantName}" im "${season}". Antworte auf Deutsch, max 50 Wörter.`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Konnte keine Tipps generieren.";
  }
};

exports.suggestInterval = async (plantName) => {
  if (!model) return null; // Kein Vorschlag möglich

  try {
    const prompt = `Gießintervall für "${plantName}" in Tagen? Antworte NUR mit der Zahl.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const number = parseInt(text.replace(/[^0-9]/g, ""));
    return isNaN(number) ? 7 : number;
  } catch (error) {
    console.error("AI Interval Error:", error);
    return 7;
  }
};
