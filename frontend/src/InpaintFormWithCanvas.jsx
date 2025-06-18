import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";

function InpaintFormWithCanvas() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });
  const [brushRadius, setBrushRadius] = useState(15);
  const canvasRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageURL(url);
    }
  }, [image]);

  const handleImageLoad = (e) => {
    const { width, height } = e.target;
    setDimensions({ width, height });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !prompt) {
      alert("Please upload an image and enter a prompt.");
      return;
    }

    // Get the mask canvas blob
    const canvas = canvasRef.current.canvas.drawing;
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("mask", blob, "mask.png");
      formData.append("prompt", prompt);

      try {
        const res = await axios.post("http://localhost:5000/inpaint", formData, {
          responseType: "blob",
        });
        const imageUrl = URL.createObjectURL(res.data);
        setResultUrl(imageUrl);
      } catch (err) {
        console.error(err);
        alert("Error processing image");
      }
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>AI Inpainting — Draw Your Mask</h2>

      <form onSubmit={handleSubmit}>
        <label>Upload Image:</label><br />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} /><br /><br />

        <label>Prompt:</label><br />
        <input
          type="text"
          placeholder="e.g., replace shirt with leather jacket"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "100%" }}
        /><br /><br />

        {imageURL && (
          <>
            <div style={{ position: "relative" }}>
              <img
                ref={imageRef}
                src={imageURL}
                alt="Uploaded"
                onLoad={handleImageLoad}
                style={{ width: dimensions.width, height: dimensions.height, position: "absolute", zIndex: 0 }}
              />
              <CanvasDraw
                ref={canvasRef}
                canvasWidth={dimensions.width}
                canvasHeight={dimensions.height}
                brushColor="#ffffff"
                brushRadius={brushRadius}
                lazyRadius={0}
                hideGrid
                style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
              />
            </div>

            <div style={{ marginTop: "10px" }}>
              <label>Brush Size: {brushRadius}</label><br />
              <input
                type="range"
                min="5"
                max="60"
                value={brushRadius}
                onChange={(e) => setBrushRadius(parseInt(e.target.value))}
              /><br /><br />

              <button type="button" onClick={() => canvasRef.current.undo()}>Undo</button>{" "}
              <button type="button" onClick={() => canvasRef.current.clear()}>Clear</button>
            </div>
          </>
        )}

        <br />
        <button type="submit">Submit for Inpainting</button>
      </form>

      {resultUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Result:</h3>
          <img src={resultUrl} alt="Result" style={{ maxWidth: "100%" }} />
          <a href={resultUrl} download="result.png">Download</a>
        </div>
      )}
    </div>
  );
}

export default InpaintFormWithCanvas;
