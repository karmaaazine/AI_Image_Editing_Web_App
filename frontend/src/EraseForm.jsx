import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function EraseForm() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [brushRadius, setBrushRadius] = useState(15);
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // White for erasing
  const canvasRef = useRef();

  // Handle image upload and set dimensions
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create URL and set dimensions
      const url = URL.createObjectURL(file);
      setImageURL(url);
      
      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = url;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    try {
      // Get the mask from canvas
      const canvas = canvasRef.current;
      const maskDataUrl = await canvas.exportImage("png");
      
      // Convert mask data URL to blob
      const maskResponse = await fetch(maskDataUrl);
      const maskBlob = await maskResponse.blob();

      // Process image for better quality
      const processedImageBlob = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 1.0); // Maximum quality
        };
        img.src = imageURL;
      });

      const formData = new FormData();
      formData.append("image", processedImageBlob, "image.jpg");
      formData.append("mask", maskBlob, "mask.png");
      // Use default prompt if none provided
      formData.append("prompt", prompt || "Seamlessly remove the masked area and fill it naturally matching the surrounding environment");

      const res = await axios.post(
        "https://ai-image-backend-project.vercel.app/erase_direct_upload",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'image/*'
          },
          responseType: "blob"
        }
      );

      const url = URL.createObjectURL(res.data);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      if (err.response) {
        const errorMessage = err.response.data instanceof Blob 
          ? await err.response.data.text()
          : err.response.data;
        alert(`Server Error: ${errorMessage}`);
      } else {
        alert("Error processing erase");
      }
    }
  };

  return (
    <div style={{ 
      padding: "40px",
      backgroundColor: "#fff",
      minHeight: "100vh",
      width: "100%"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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

        <div style={{ display: "flex", gap: "20px" }}>
          {/* Left Sidebar - Tools */}
          <div style={{ 
            width: "200px", 
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
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
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="image-upload"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: "14px"
                }}
              >
                Choose Image
              </label>
            </div>

            <div>
              <label>Brush Size: {brushRadius}px</label>
              <input
                type="range"
                min="5"
                max="60"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <button 
              onClick={() => canvasRef.current?.clearCanvas()}
              style={{
                padding: "8px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Clear Mask
            </button>

            <button 
              onClick={() => canvasRef.current?.undo()}
              style={{
                padding: "8px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Undo
            </button>
          </div>

          {/* Main Canvas Area */}
          <div style={{ flex: 1 }}>
            {imageURL ? (
              <div style={{
                position: "relative",
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  strokeWidth={brushRadius}
                  strokeColor={selectedColor}
                  backgroundImage={imageURL}
                  exportWithBackgroundImage={false}
                  style={{
                    border: "none"
                  }}
                />
              </div>
            ) : (
              <div style={{
                width: "100%",
                height: "500px",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666"
              }}>
                Upload an image to start erasing
              </div>
            )}
          </div>
        </div>

        {/* Bottom Area - Prompt and Generate */}
        <div style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px"
        }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: Describe how to fill the erased area (leave empty for automatic filling)"
            style={{ 
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
          <button 
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Erase Object
          </button>
        </div>

        {/* Results */}
        {resultUrl && (
          <div style={{ 
            marginTop: "40px",
            textAlign: "center"
          }}>
            <h3 style={{ 
              color: "#2c3e50",
              marginBottom: "20px",
              fontSize: "24px"
            }}>Result:</h3>
            <img 
              src={resultUrl} 
              alt="Result" 
              style={{ 
                maxWidth: "100%",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }} 
            />
            <a 
              href={resultUrl} 
              download="erased-image.png"
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
  );
}

export default EraseForm;
