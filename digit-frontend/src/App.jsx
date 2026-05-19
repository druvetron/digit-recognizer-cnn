import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState('?');

  // Initialize the canvas with a black background
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // --- Drawing Logic ---
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction('?');
  };

  // --- Image Extraction and API Call ---
  const handlePredict = async () => {
    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    const hiddenCtx = hiddenCanvas.getContext('2d');

    // Scale down the 280x280 canvas to 28x28
    hiddenCtx.drawImage(canvas, 0, 0, 28, 28);

    // Extract the raw pixel data
    const imageData = hiddenCtx.getImageData(0, 0, 28, 28);
    const data = imageData.data;
    const grayscaleArray = [];

    // Convert RGBA to a flat grayscale array of 784 numbers
    for (let i = 0; i < data.length; i += 4) {
      grayscaleArray.push(data[i]); // Red channel equals brightness
    }

    setPrediction('Thinking...');

    try {
      // Send the 1D array to the Flask backend
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixels: grayscaleArray })
      });
      
      const result = await response.json();
      
      if (result.error) {
        setPrediction('Error from API');
        console.error(result.error);
      } else {
        setPrediction(result.prediction);
      }
      
    } catch (error) {
      console.error('Error connecting to API:', error);
      setPrediction('Error: Is Flask running?');
    }
  };

  return (
    <div className="app-container">
      <h2>Digit Recognizer</h2>
      
      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="drawing-board"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />

      {/* Hidden Processing Canvas */}
      <canvas
        ref={hiddenCanvasRef}
        width={28}
        height={28}
        style={{ display: 'none' }}
      />

      <div className="button-group">
        <button onClick={clearCanvas} className="clear-btn">Clear</button>
        <button onClick={handlePredict} className="predict-btn">Predict</button>
      </div>

      <div className="prediction-box">
        Prediction: <span>{prediction}</span>
      </div>
    </div>
  );
}

export default App;