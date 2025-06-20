import React, { useState } from "react";
import axios from "axios";

function InpaintForm() {
  const [image, setImage] = useState(null);
  const [mask, setMask] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !mask || !prompt) {
      alert("Please upload both image and mask, and enter a prompt.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("mask", mask);
    formData.append("prompt", prompt);
    // if testing locally use 'https://localhost:50000'
    try {
      setLoading(true);
      const res = await axios.post("https://ai-image-backend-project.vercel.app/inpaint_direct_upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
    });


      const imageUrl = URL.createObjectURL(res.data);
      setResultUrl(imageUrl);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Check the server and your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>AI Inpainting</h2>
      <form onSubmit={handleSubmit}>
        <label>Original Image:</label><br />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} /><br /><br />

        <label>Mask Image:</label><br />
        <input type="file" onChange={(e) => setMask(e.target.files[0])} /><br /><br />

        <label>Prompt:</label><br />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. replace with a mountain"
          style={{ width: "100%" }}
        /><br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Inpaint"}
        </button>
      </form>

      {resultUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Result:</h3>
          <img src={resultUrl} alt="Inpainted result" style={{ maxWidth: "100%" }} />
          <a href={resultUrl} download="result.png">Download</a>
        </div>
      )}
    </div>
  );
}

export default InpaintForm;
