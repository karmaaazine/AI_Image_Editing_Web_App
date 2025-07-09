import React, { useRef, useState, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InpaintFormWithCanvas() {
  const navigate = useNavigate();
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
      
      // Create a temporary image to get dimensions
      const img = new Image();
      img.onload = () => handleImageLoad({ target: img });
      img.src = url;
    }
  }, [image]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    
    // Optional: Scale down very large images while maintaining aspect ratio
    const maxWidth = 1920;  // Maximum width we want to allow
    const maxHeight = 1080; // Maximum height we want to allow
    
    let finalWidth = naturalWidth;
    let finalHeight = naturalHeight;
    
    if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
      const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
      finalWidth = Math.round(naturalWidth * ratio);
      finalHeight = Math.round(naturalHeight * ratio);
    }
    
    setDimensions({ 
      width: finalWidth, 
      height: finalHeight 
    });
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

      // Convert image to correct format if needed
      const imageBlob = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        };
        img.src = imageURL;
      });

      // Create form data
      const formData = new FormData();
      formData.append("image", imageBlob, "image.jpg");  // Add proper filename and type
      formData.append("mask", maskBlob, "mask.png");     // Add proper filename and type
      formData.append("prompt", prompt);

      // Log the form data to verify contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Send to backend
      const response = await axios.post(
        "https://ai-image-backend-project.vercel.app/inpaint", 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'image/*'
          },
          responseType: 'arraybuffer'
        }
      );

      if (response.status === 200) {
        const imageUrl = URL.createObjectURL(
          new Blob([response.data], { type: 'image/webp' })
        );
        setResultUrl(imageUrl);
      }
    } catch (err) {
      console.error('Error details:', err);
      // Better error handling
      if (err.response) {
        // Convert ArrayBuffer to text if needed
        let errorMessage = '';
        if (err.response.data instanceof ArrayBuffer) {
          errorMessage = new TextDecoder().decode(err.response.data);
        } else {
          errorMessage = typeof err.response.data === 'object' 
            ? JSON.stringify(err.response.data) 
            : err.response.data;
        }
        alert(`Server Error: ${errorMessage}`);
      } else if (err.request) {
        alert("No response received from server. Please try again.");
      } else {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      padding: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.95)", // Semi-transparent white
      backdropFilter: "blur(10px)"  // Blur any background that might show through
    }}>
      {/* Add Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          width: "fit-content",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px"
        }}
      >
        ← Back
      </button>

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
              id="file-upload"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImage(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}  // Hide the default input
            />
            <label
              htmlFor="file-upload"
              style={{
                backgroundColor: "#007bff",  // Same blue as your other buttons
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                display: "inline-block",
                marginTop: "5px",
                border: "none",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}  // Darker on hover
              onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}   // Back to normal
            >
              Upload Picture
            </label>
            {image && (
              <div style={{ 
                marginTop: "5px", 
                fontSize: "14px", 
                color: "#666" 
              }}>
                {image.name}
              </div>
            )}
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
        <div style={{ flex: 1, position: "relative", overflow: "auto" }}>  {/* Added overflow: "auto" to handle large images */}
          {imageURL ? (
            <div style={{
              position: "relative",
              width: `${dimensions.width}px`,  // Use actual image dimensions
              height: `${dimensions.height}px`,  // Use actual image dimensions
              border: "1px solid #ccc",
              borderRadius: "8px",
              margin: "auto"  // Center the canvas
            }}>
              <ReactSketchCanvas
                ref={canvasRef}
                width={dimensions.width}    // Use actual image width
                height={dimensions.height}  // Use actual image height
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
              height: "500px",  // Default height when no image
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

