const model = require("../config/gemini");

exports.getCareTips = async (plantName, season) => {
  if (!model) return "KI nicht konfiguriert.";

  try {
    // ÄNDERUNGEN HIER:
    // 1. Persona: "Pflanzen-Buddy" statt nur Gärtner (lockerer Ton).
    // 2. Formatierung: Explizite Anweisung für Emojis und Zeilenumbrüche.
    // 3. Verbot: "Keine Markdown-Formatierung" verhindert die **Sternchen**.
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
    console.error("AI Error:", error);
    return "Konnte keine Tipps generieren.";
  }
};

exports.suggestInterval = async (plantName) => {
  if (!model) return null;

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
