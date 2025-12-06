import React, { useState } from "react";
import "./PlantAssistant.css";
import { PixelBot } from "./PixelBot";
import { BACKEND_URL } from "../constants";

export const PlantAssistant = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hallo! Ich bin dein Pflanzen-Bot.🌱 Hast du Fragen zu deinen Pflanzen?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const messageToSend = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      // 3. Antwort vom Bot anzeigen
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Fehler beim Chatten:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Oh nein, Verbindungsfehler! Ist dein Server an? 🔌",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="assistant-overlay">
      <div className="assistant-window">
        <div className="assistant-header">
          <div className="bot-avatar-small">
            <PixelBot />
          </div>
          <div className="header-title">
            <h3>Plant AI</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Chat Verlauf */}
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="bubble typing">...</div>
            </div>
          )}
        </div>

        {/* Eingabe Bereich */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Stell eine Frage über deine Pflanze..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>senden</button>
        </div>
      </div>
    </div>
  );
};
