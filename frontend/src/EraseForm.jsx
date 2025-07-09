import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EraseForm() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [mask, setMask] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !mask) {
      alert("Please upload both the image and the mask.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("mask", mask);
    formData.append("prompt", prompt);
    // if backend deployed use 'https://ai-image-backend-project.vercel.app/erase_direct_upload'
    try {
      const res = await axios.post("https://ai-image-backend-project.vercel.app/erase_direct_upload", formData, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      alert("Error processing erase");
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
        }}>Erase Object</h2>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ 
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            {/* Image Upload */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "10px", 
                color: "#2c3e50",
                fontSize: "16px" 
              }}>Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                id="image-upload"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="image-upload"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background-color 0.2s"
                }}
              >
                Choose Image
              </label>
            </div>

            {/* Mask Upload */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "10px", 
                color: "#2c3e50",
                fontSize: "16px" 
              }}>Upload Mask:</label>
              <input
                type="file"
                accept="image/*"
                id="mask-upload"
                onChange={(e) => setMask(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="mask-upload"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background-color 0.2s"
                }}
              >
                Choose Mask
              </label>
            </div>

            {/* Optional Prompt */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "10px", 
                color: "#2c3e50",
                fontSize: "16px" 
              }}>Optional Prompt:</label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional (Leave empty if no prompt)"
                style={{ 
                  width: "100%",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "16px"
                }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
                transition: "background-color 0.2s"
              }}
            >
              Erase Object
            </button>
          </form>

          {/* Result Section */}
          {resultUrl && (
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <h3 style={{ 
                color: "#2c3e50", 
                marginBottom: "20px",
                fontSize: "24px"
              }}>Result:</h3>
              <img 
                src={resultUrl} 
                alt="Erased Result" 
                style={{ 
                  maxWidth: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }} 
              />
              <a 
                href={resultUrl} 
                download="erased.png"
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

export default EraseForm;
