import { useState } from "react";
import axios from "axios";
import SimpleChat from "@/components/SimpleChat";

export default function ImportAssistantPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("/api/transactions/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(res.data.message || "✅ Import successful!");
    } catch (error) {
      console.error("❌ Upload error:", error);
      setMessage("Import failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "800px", fontFamily: "Urbanist, sans-serif" }}>
      <h2 className="text-center mb-4" style={{ color: "#1e3a8a", textTransform: "lowercase", fontWeight: 700 }}>
        Import Assistant
      </h2>

      <div className="bg-white rounded shadow-sm p-4 mb-5">
        <h5 className="mb-3">📂 Import CSV File</h5>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="form-control mb-3"
        />
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {message && (
          <div className={`mt-3 ${message.includes("failed") ? "text-danger" : "text-success"}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h5 className="mb-3">💬 Talk to Bliss</h5>
        <SimpleChat />
      </div>
    </div>
  );
}
