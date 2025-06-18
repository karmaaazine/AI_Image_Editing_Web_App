import React from 'react';
import InpaintForm from './InpaintForm';
import TextToImageForm from "./TextToImageForm";


function App() {
  return (
    <div className="App">
      <h1>AI Image Editing Web App</h1>
        <InpaintForm />
      <hr />
      <TextToImageForm />
    </div>
  );
}

export default App;
