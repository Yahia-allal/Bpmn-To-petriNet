import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Accueil.css';

export default function Accueil() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem("selectedBpmnFile");
    sessionStorage.removeItem("selectedBpmnFileName");
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTransformClick = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem('selectedBpmnFile', reader.result);
        sessionStorage.setItem('selectedBpmnFileName', file.name);
        navigate('/transformation');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="accueil-container">
      <h1 className="title">Transformation de Model BPMN</h1>
      <p className="subtitle">
        Choisissez un fichier d’extension <strong>BPMN</strong>
      </p>

      <input
        type="file"
        accept=".bpmn"
        id="fileInput"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="fileInput" className="btn btn-green">
        📁 Choisir fichier...
      </label>

      <button
        className="btn btn-purple"
        disabled={!file}
        onClick={handleTransformClick}
        style={{ marginLeft: 30 }}
      >
        Transformer
      </button>

      <div className="example-bpmn-container">
        <img
          src="/bpmn.gif"
          alt="Exemple BPMN 2.0"
          className="example-bpmn-image"
        />
        <p className="example-bpmn-text">Exemple de BPMN 2.0</p>
      </div>
    </div>
  );
}
