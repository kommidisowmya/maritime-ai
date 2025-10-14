import React, { useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

function App() {
  const [imageURL, setImageURL] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const imageRef = useRef();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageURL(URL.createObjectURL(file));
      setPredictions([]);
    }
  };

  const handleDetect = async () => {
    if (!imageRef.current) return;
    const model = await mobilenet.load();
    const preds = await model.classify(imageRef.current);
    setPredictions(preds);
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>AI Image Detection</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {imageURL && (
        <div style={{ marginTop: "1rem" }}>
          <img
            src={imageURL}
            ref={imageRef}
            alt="upload"
            width="300"
            style={{ borderRadius: "10px" }}
          />
          <br />
          <button
            onClick={handleDetect}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Detect
          </button>
        </div>
      )}
      <div style={{ marginTop: "2rem" }}>
        {predictions.map((pred, i) => (
          <div key={i}>
            <strong>{pred.className}</strong> — {(pred.probability * 100).toFixed(2)}%
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
