import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import axios from "axios";

function InpaintFormWithCanvas() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [brushRadius, setBrushRadius] = useState(15);
  const [selectedColor, setSelectedColor] = useState("#ff0000"); // Default red color
  const [isEraser, setIsEraser] = useState(false);
  const canvasRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageURL(url);
    }
  }, [image]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // Convert colored mask to black and white
  const convertToBlackAndWhite = async (coloredMaskDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw the colored mask
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to black and white
        for (let i = 0; i < data.length; i += 4) {
          // If pixel has any color/alpha, make it white, otherwise black
          const hasColor = data[i + 3] > 0; // Check alpha channel
          data[i] = hasColor ? 255 : 0;     // R
          data[i + 1] = hasColor ? 255 : 0; // G
          data[i + 2] = hasColor ? 255 : 0; // B
          data[i + 3] = 255;                // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = coloredMaskDataUrl;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !prompt) {
      alert("Please upload an image and enter a prompt.");
      return;
    }

    try {
      // Get the colored mask
      const canvas = canvasRef.current;
      const coloredMaskDataUrl = await canvas.exportImage("png");
      
      // Convert to black and white
      const bwMaskDataUrl = await convertToBlackAndWhite(coloredMaskDataUrl);
      
      // Convert base64 to blob
      const bwMaskResponse = await fetch(bwMaskDataUrl);
      const maskBlob = await bwMaskResponse.blob();

      // Create form data
      const formData = new FormData();
      formData.append("image", image);
      formData.append("mask", maskBlob);
      formData.append("prompt", prompt);

      // Send to backend
      const response = await axios.post("http://localhost:5000/inpaint", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer'
      });

      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(
          new Blob([response.data], { type: 'image/webp' })
        );
        setResultUrl(imageUrl);
      } else {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (err) {
      console.error('Error details:', err);
      alert(`Error processing image: ${err.message}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "20px" }}>
      <h2>AI Inpainting — Draw Your Mask</h2>

      <div style={{ display: "flex", flex: 1, gap: "20px" }}>
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
            <label>Upload Image:</label><br />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImage(e.target.files[0]);
                }
              }}
            />
          </div>

          <div>
            <label>Brush Size: {brushRadius}px</label><br />
            <input
              type="range"
              min="5"
              max="60"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label>Brush Color:</label><br />
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                setIsEraser(false);
              }}
            />
          </div>

          <button
            onClick={() => {
              setIsEraser(!isEraser);
              if (!isEraser) {
                setSelectedColor("#ffffff");
              }
            }}
            style={{
              backgroundColor: isEraser ? "#007bff" : "#6c757d",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "4px"
            }}
          >
            {isEraser ? "Brush" : "Eraser"}
          </button>

          <button onClick={() => canvasRef.current.undo()}>Undo</button>
          <button onClick={() => canvasRef.current.clearCanvas()}>Clear</button>
        </div>

        {/* Main Canvas Area */}
        <div style={{ flex: 1, position: "relative" }}>
          {imageURL ? (
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <ReactSketchCanvas
                ref={canvasRef}
                width="100%"
                height="100%"
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
              height: "100%",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              Upload an image to start editing
            </div>
          )}
        </div>
      </div>

      {/* Bottom Area - Prompt and Generate */}
      <div style={{
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        display: "flex",
        gap: "10px"
      }}>
        <input
          type="text"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Generate
        </button>
      </div>

      {/* Results Area */}
      {resultUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <img 
            src={resultUrl} 
            alt="Result" 
            style={{ 
              maxWidth: "100%",
              borderRadius: "8px"
            }} 
          />
          <a 
            href={resultUrl} 
            download="result.webp"
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px"
            }}
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}

export default InpaintFormWithCanvas;

