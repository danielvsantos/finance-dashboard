// components/SimpleChat.js
import { useState } from "react";

export default function SimpleChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/open-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, threadId }),
      });

      const data = await res.json();

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data?.threadId && !threadId) {
          setThreadId(data.threadId); // Save the thread ID to continue the convo
        }
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
        {messages.map((msg, idx) => (
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
        {loading && <div className="text-muted">BLISS is thinking...</div>}
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
