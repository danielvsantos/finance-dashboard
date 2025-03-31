// components/SimpleChat.js
import { useState } from "react";

export default function SimpleChat() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant for onboarding personal finance data." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/open-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }]);
      }
    } catch (err) {
      console.error("API error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "API error occurred." }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">Need help? Ask BLISS 👇</h2>

      <div className="border rounded p-3 mb-3" style={{ minHeight: "400px", background: "#f9f9f9" }}>
        {messages.slice(1).map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === "user" ? "text-end" : ""}`}>
            <div
              className={`d-inline-block p-2 rounded ${
                msg.role === "user" ? "bg-primary text-white" : "bg-light"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-muted">Assistant is typing...</div>}
      </div>

      <textarea
        className="form-control mb-2"
        rows={2}
        placeholder="Ask something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn-primary w-100" onClick={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  );
}
