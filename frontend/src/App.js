import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InpaintFormWithCanvas from './InpaintFormWithCanvas';
import TextToImageForm from './TextToImageForm';
import EraseForm from './EraseForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App" style={{ 
        minHeight: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative"
      }}>
        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <nav style={{
            padding: "20px 40px",
            backgroundColor: "rgba(26, 32, 44, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ 
              color: "white", 
              fontSize: "24px", 
              fontWeight: "bold",
              letterSpacing: "2px"
            }}>
              AI STUDIO
            </div>
          </nav>

          <Routes>
            <Route path="/" element={
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '60px 20px',
                maxWidth: '1200px',
                margin: '0 auto',
                gap: '40px'
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '40px'
                }}>
                  <h1 style={{
                    fontSize: '48px',
                    color: 'white',
                    marginBottom: '20px',
                    letterSpacing: '3px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>CREATIVE DESIGN</h1>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: '18px',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}>
                    Transform your ideas into reality with our AI-powered image editing tools.
                  </p>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '30px',
                  width: '100%',
                  maxWidth: '900px'
                }}>
                  {[
                    { title: 'Inpaint Image', path: '/inpaint', desc: 'Edit and enhance specific areas of your images' },
                    { title: 'Text to Image', path: '/text-to-image', desc: 'Generate unique images from text descriptions' },
                    { title: 'Erase Object', path: '/erase', desc: 'Remove unwanted objects from your images' }
                  ].map((item) => (
                    <div key={item.path} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '30px',
                      textAlign: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => window.location.href = item.path}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    >
                      <h3 style={{ 
                        color: 'white',
                        marginBottom: '15px',
                        fontSize: '20px',
                        letterSpacing: '1px'
                      }}>{item.title}</h3>
                      <p style={{
                        color: '#e2e8f0',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            } />
            <Route path="/inpaint" element={<InpaintFormWithCanvas />} />
            <Route path="/text-to-image" element={<TextToImageForm />} />
            <Route path="/erase" element={<EraseForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
