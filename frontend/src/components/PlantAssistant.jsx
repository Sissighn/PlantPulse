import React, { useState, useRef } from "react";
import "./PlantAssistant.css";
import { PixelBot } from "./PixelBot";
import { BACKEND_URL } from "../constants";
import { Image as ImageIcon, X } from "lucide-react";

export const PlantAssistant = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hallo! Ich bin dein Pflanzen-Bot.🌱 Hast du Fragen zu deinen Pflanzen?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
    };
    setMessages((prev) => [...prev, userMsg]);

    const messageToSend = input;
    const imageToSend = selectedImage;

    setInput("");
    setIsTyping(true);
    setSelectedImage(null);

    try {
      const formData = new FormData();
      formData.append("message", messageToSend);
      if (imageToSend) {
        formData.append("image", imageToSend);
      }

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        // WICHTIG: Bei FormData KEINEN 'Content-Type' Header setzen!
        // Der Browser macht das automatisch richtig mit "boundary".
        body: formData,
      });

      if (!response.ok) throw new Error("Server Fehler");

      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Fehler beim Senden! 🔌" },
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
              <div className="bubble-container">
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Upload"
                    className="chat-upload-preview"
                  />
                )}
                {msg.text && <div className="bubble">{msg.text}</div>}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="bubble typing">...</div>
            </div>
          )}
        </div>

        {/* Eingabe Bereich */}
        <div className="input-area-wrapper">
          {selectedImage && (
            <div className="image-preview-bar">
              <span>{selectedImage.name}</span>
              <button onClick={() => setSelectedImage(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="input-area">
            {/* Versteckter File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />

            {/* Bild Button */}
            <button
              className="icon-btn"
              onClick={() => fileInputRef.current.click()}
              title="Foto hochladen"
            >
              <ImageIcon size={20} />
            </button>

            <input
              type="text"
              placeholder="Frag was oder lad ein Bild hoch..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
