import React, { useCallback, useEffect, useRef, useState } from "react";
import "./PlantAssistant.css";
import { PixelBot } from "../pixelBot/PixelBot";
import { BACKEND_URL } from "../../constants";
import { Image as ImageIcon, X, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";
const LEGACY_CLEARED_MESSAGES = [
  "The chat history has been cleared. We can start fresh.",
  "Der Chatverlauf wurde gelöscht. Wir können neu starten.",
  "Gedächtnis gelöscht! 🧹 Fangen wir von vorne an.",
];
const LEGACY_WELCOME_MESSAGES = [
  "Hi! I'm your plant bot. Do you have questions about your plants?",
  "Hallo! Ich bin dein Pflanzen-Bot. Hast du Fragen zu deinen Pflanzen?",
  "Hallo! Ich bin dein Pflanzen-Bot.🌱 Hast du Fragen zu deinen Pflanzen?",
];

function createInitialMessage(t) {
  return {
    sender: "ai",
    text: t("dic.assistantWelcome"),
  };
}

function isClearedHistoryPlaceholder(messages, t) {
  return (
    messages.length === 1 &&
    messages[0]?.sender === "ai" &&
    [
      t("dic.assistantHistoryCleared"),
      ...LEGACY_CLEARED_MESSAGES,
    ].includes(messages[0]?.text)
  );
}

function isLocalizedPlaceholder(messages, t) {
  return (
    isClearedHistoryPlaceholder(messages, t) ||
    (messages.length === 1 &&
      messages[0]?.sender === "ai" &&
      [t("dic.assistantWelcome"), ...LEGACY_WELCOME_MESSAGES].includes(
        messages[0]?.text,
      ))
  );
}

export const PlantAssistant = ({ onClose, userId }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const chatEndRef = useRef(null);
  const previousFocusRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const [messages, setMessages] = useState(() => [createInitialMessage(t)]);
  const [isTyping, setIsTyping] = useState(false);
  const chatStorageKey = `plantChatHistory:${userId || "session"}`;

  useEffect(() => {
    const savedChat = localStorage.getItem(chatStorageKey);
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat);
        setMessages(
          isLocalizedPlaceholder(parsedChat, t)
            ? [createInitialMessage(t)]
            : parsedChat,
        );
      } catch (e) {
        console.error("Could not load assistant chat history", e);
      }
    }
  }, [chatStorageKey, t]);

  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey, messages]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    inputRef.current?.focus();

    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previousFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImagePreview(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    objectUrlsRef.current.push(previewUrl);
    setSelectedImagePreview(previewUrl);
  }, [selectedImage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      const visibleFocusable = Array.from(focusable).filter(
        (element) => !element.disabled && element.offsetParent !== null,
      );

      if (visibleFocusable.length === 0) return;

      const first = visibleFocusable[0];
      const last = visibleFocusable[visibleFocusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const clearChat = useCallback(() => {
    localStorage.removeItem(chatStorageKey);
    setMessages([createInitialMessage(t)]);
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    inputRef.current?.focus();
  }, [chatStorageKey, t]);

  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    inputRef.current?.focus();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setSelectedImage(null);
      setUploadError(t("dic.assistantUploadTooLarge", { maxSize: "5 MB" }));
      e.target.value = "";
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setSelectedImage(null);
      setUploadError(t("dic.assistantUploadUnsupported"));
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if ((!trimmedInput && !selectedImage) || isTyping) return;

    const userMsg = {
      sender: "user",
      text: trimmedInput,
      image: selectedImagePreview,
    };
    setMessages((prev) => [...prev, userMsg]);

    const messageToSend = trimmedInput;
    const imageToSend = selectedImage;

    const historyToSend = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text || "" }],
    }));

    setInput("");
    setSelectedImage(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append("message", messageToSend);
      formData.append("history", JSON.stringify(historyToSend));
      if (imageToSend) {
        formData.append("image", imageToSend);
      }

      const response = await fetch(`${BACKEND_URL}/chat`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          response.status < 500
            ? errorData?.message || t("dic.assistantSendError")
            : t("dic.assistantSendError");
        throw new Error(message);
      }

      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: error.message || t("dic.assistantSendError") },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="assistant-overlay" onMouseDown={onClose}>
      <div
        aria-describedby="plant-assistant-description"
        aria-labelledby="plant-assistant-title"
        aria-modal="true"
        className="assistant-window"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <div className="assistant-header">
          <div className="bot-avatar-small">
            <PixelBot />
          </div>
          <div className="header-title">
            <h3 id="plant-assistant-title">{t("dic.assistantTitle")}</h3>
            <p id="plant-assistant-description">
              {t("dic.assistantSubtitle")}
            </p>
          </div>
          <button
            aria-label={t("dic.assistantClearChat")}
            className="assistant-header-btn"
            onClick={clearChat}
            title={t("dic.assistantClearChat")}
            type="button"
          >
            <Trash2 size={20} />
          </button>
          <button
            aria-label={t("dic.assistantClose")}
            className="close-btn"
            onClick={onClose}
            title={t("dic.assistantClose")}
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div
          aria-label={t("dic.assistantConversation")}
          aria-live="polite"
          className="chat-history"
          role="log"
        >
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="bubble-container">
                {msg.image && (
                  <img
                    src={msg.image}
                    alt={t("dic.assistantUploadedImageAlt")}
                    className="chat-upload-preview"
                  />
                )}
                {msg.text && <div className="bubble">{msg.text}</div>}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai">
              <div className="bubble typing">{t("dic.assistantTyping")}</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-area-wrapper">
          {selectedImage && (
            <div className="image-preview-bar">
              <span>{selectedImage.name}</span>
              <button
                aria-label={t("dic.assistantRemoveImage")}
                onClick={clearSelectedImage}
                title={t("dic.assistantRemoveImage")}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {uploadError && (
            <p className="assistant-upload-error" role="alert">
              {uploadError}
            </p>
          )}

          <div className="input-area">
            <input
              accept={ACCEPTED_IMAGE_TYPES}
              aria-label={t("dic.assistantUploadPhoto")}
              className="visually-hidden-file"
              onChange={handleImageSelect}
              ref={fileInputRef}
              tabIndex={-1}
              type="file"
            />

            <button
              aria-label={t("dic.assistantUploadPhoto")}
              className="icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title={t("dic.assistantUploadPhoto")}
              type="button"
            >
              <ImageIcon size={20} />
            </button>

            <input
              aria-label={t("dic.assistantInputLabel")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("dic.assistantInputPlaceholder")}
              ref={inputRef}
              type="text"
              value={input}
            />
            <button
              className="send-btn"
              disabled={isTyping || (!input.trim() && !selectedImage)}
              onClick={handleSend}
              type="button"
            >
              {t("dic.assistantSend")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
