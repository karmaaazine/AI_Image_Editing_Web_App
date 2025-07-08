import React, { useState } from "react";
import InpaintFormWithCanvas from "./InpaintFormWithCanvas";
import TextToImageForm from "./TextToImageForm";
import EraseForm from './EraseForm';


function App() {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>🧠 AI Image Editing Web App</h1>

      {/* Menu List */}
      {!selectedTool && (
        <div style={{ maxWidth: "400px", margin: "auto" }}>
          <h2>Choose a tool:</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ margin: "10px 0" }}>
              <button
                onClick={() => setSelectedTool("inpaint")}
                style={buttonStyle}
              >
                Inpaint an Image
              </button>
            </li>
            <li style={{ margin: "10px 0" }}>
              <button
                onClick={() => setSelectedTool("text2img")}
                style={buttonStyle}
              >
                Generate from Text
              </button>
            </li>
            <li style={{ margin: "10px 0" }}>
              <button
                onClick={() => setSelectedTool("erase")}
                style={buttonStyle}
              >
                Erase an Object
              </button>
            </li>
          </ul>
        </div> 
      )}

      {/* Show selected tool */}
      {selectedTool === "inpaint" && (
        <>
          <InpaintFormWithCanvas />
          <button onClick={() => setSelectedTool(null)} style={backButtonStyle}>⬅️ Back</button>
        </>
      )}

      {selectedTool === "text2img" && (
        <>
          <TextToImageForm />
          <button onClick={() => setSelectedTool(null)} style={backButtonStyle}>⬅️ Back</button>
        </>
      )}

      {selectedTool === "erase" && (
        <>
          <EraseForm />
          <button onClick={() => setSelectedTool(null)} style={backButtonStyle}>⬅️ Back</button>
        </>
      )}
    </div>
  );
}

// Styling
const buttonStyle = {
  width: "100%",
  padding: "15px",
  fontSize: "16px",
  backgroundColor: "#008CBA",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};

const backButtonStyle = {
  marginTop: "20px",
  backgroundColor: "#eee",
  padding: "10px 15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  cursor: "pointer"
};

export default App;
