import React, { useState } from "react";
import axios from "axios";

function EraseForm() {
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
    // if testing locally use 'https://localhost:50000'
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
    <div>
      <h2>Upload Image and Mask</h2>
      <form onSubmit={handleSubmit}>
        <label>Upload Image:</label><br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        /><br /><br />

        <label>Upload Mask (same size as image):</label><br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMask(e.target.files[0])}
        /><br /><br />

        <label>Optional Prompt:</label><br />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Optional (Leave empty if no prompt)"
          style={{ width: "100%" }}
        /><br /><br />

        <button type="submit">Erase</button>
      </form>

      {resultUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Result:</h3>
          <img src={resultUrl} alt="Erased Result" style={{ maxWidth: "100%" }} />
          <br />
          <a href={resultUrl} download="erased.png">Download</a>
        </div>
      )}
    </div>
  );
}

export default EraseForm;
