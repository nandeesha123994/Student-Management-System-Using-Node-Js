import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import "../styles/Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I'm your AI Assistant. Ask me about leave requests, attendance, courses, announcements, or doubts. For example: 'Is my leave approved?', 'What's my attendance percentage?', 'What courses am I enrolled in?', 'What are the latest announcements?', or 'What about my doubts?'.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const messageText = inputMessage.trim();

    if (!messageText || loading) return;

    // Add user message to chat
    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await api.post("/chatbot/ask", {
        message: messageText,
      });

      const botMsg = {
        sender: "bot",
        text: response.data.answer || "No response received.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chatbot Request Error:", error);
      const errorMsg = {
        sender: "bot",
        text:
          error.response?.data?.message ||
          "Sorry, something went wrong while processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open AI Assistant"
        >
          <span className="chatbot-icon">🤖</span>
          <span className="chatbot-btn-text">AI Assistant</span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="chatbot-window">
          {/* HEADER */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="chatbot-header-icon">🤖</span>
              <div>
                <h3>Student AI Assistant</h3>
                <span className="chatbot-status-online">● Online</span>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* MESSAGES CONTAINER */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${
                  msg.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="chatbot-avatar">🤖</div>
                )}
                <div
                  className={`chatbot-bubble ${
                    msg.sender === "user" ? "user-bubble" : "bot-bubble"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* LOADING STATE */}
            {loading && (
              <div className="chatbot-message-row bot-row">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-bubble bot-bubble loading-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* INPUT FORM */}
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about leave, attendance, courses, announcements, or doubts..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!inputMessage.trim() || loading}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
