const model = require("../config/gemini");

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

exports.chatWithBot = async (userMessage) => {
  if (!model) return "Verbindung zum Robo-Gehirn unterbrochen! 🔌";

  try {
    const prompt = `
      Du bist "SproutBot", ein kleiner, freundlicher Pixel-Roboter mit einem grünen Pflänzchen auf dem Kopf. 
      Du lebst in einer Pflanzen-App und hilfst dem User.
      
      User Nachricht: "${userMessage}"

      Deine Anweisungen:
      1. Antworte kurz, hilfreich und charmant.
      2. Du bist ein Pflanzen-Experte, aber erklärst es einfach.
      3. Wenn der User "Hallo" sagt, stell dich als SproutBot vor und erwähne dein Pflänzchen auf dem Kopf.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Bip Bop... mein Prozessor raucht. Versuch es später nochmal! 🤖💥";
  }
};
