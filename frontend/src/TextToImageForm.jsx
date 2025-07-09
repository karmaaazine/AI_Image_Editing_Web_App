import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TextToImageForm() {
  const navigate = useNavigate();
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
        { 
          responseType: "blob",
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    } catch (err) {
      console.error("Frontend error:", err);
      if (err.response) {
        const errorMessage = err.response.data instanceof Blob 
          ? await err.response.data.text()
          : err.response.data;
        alert(`Server Error: ${errorMessage}`);
      } else if (err.request) {
        alert("No response received from server. Please try again.");
      } else {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "40px",
      backgroundColor: "#fff",  // Solid white background
      minHeight: "100vh",
      width: "100%"  // Full width
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>  {/* Content container */}
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "40px",
            fontSize: "16px"
          }}
        >
          ← Back
        </button>

        <h2 style={{
          fontSize: "32px",
          marginBottom: "30px",
          textAlign: "center",
          color: "#2c3e50"
        }}>Text to Image</h2>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            color: "#2c3e50",
            fontSize: "16px" 
          }}>Prompt:</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a futuristic city on Mars"
            style={{ 
              width: "100%", 
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              marginBottom: "20px",
              fontSize: "16px"
            }}
          />

          <label style={{ 
            display: "block", 
            marginBottom: "10px", 
            color: "#2c3e50",
            fontSize: "16px"
          }}>Aspect Ratio:</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={{ 
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              marginBottom: "30px",
              fontSize: "16px"
            }}
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Wide)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:3">4:3 (Standard)</option>
          </select>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {imageUrl && (
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <img 
                src={imageUrl} 
                alt="Generated result" 
                style={{ 
                  maxWidth: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }} 
              />
              <a 
                href={imageUrl} 
                download="generated.png"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  textDecoration: "none"
                }}
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextToImageForm;
