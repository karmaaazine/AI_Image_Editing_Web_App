import React, { useState } from "react";
import axios from "axios";

function TextToImageForm() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1"); // ✅ Declare here
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    setLoading(true);
    setImageUrl(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("aspect_ratio", aspectRatio); // ✅ Send to backend
    // if testing locally use 'https://localhost:50000'
    try {
      const response = await axios.post(
        "http://localhost:5000/generate",
        formData,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    } catch (err) {
      console.error("Frontend error:", err.response?.data || err.message);
      alert("❌ Error generating image. Check terminal for more info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "30px" }}>
      <h2>Text to Image</h2>

      <label>Prompt:</label><br />
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., a futuristic city on Mars"
        style={{ width: "100%", padding: "8px" }}
      /><br /><br />

      <label>Aspect Ratio:</label><br />
      <select
        value={aspectRatio}
        onChange={(e) => setAspectRatio(e.target.value)}
        style={{ padding: "5px", width: "100%" }}
      >
        <option value="1:1">1:1 (Square)</option>
        <option value="16:9">16:9 (Wide)</option>
        <option value="9:16">9:16 (Portrait)</option>
        <option value="4:3">4:3 (Standard)</option>
      </select><br /><br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageUrl} alt="Generated result" style={{ maxWidth: "100%" }} />
          <a href={imageUrl} download="generated.png">Download</a>
        </div>
      )}
    </div>
  );
}

export default TextToImageForm;
