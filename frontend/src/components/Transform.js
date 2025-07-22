import React, { useState } from 'react';

export default function Transform() {
  const [file, setFile] = useState(null);
  const [pnmlContent, setPnmlContent] = useState('');
  const [pnmlBlob, setPnmlBlob] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPnmlContent('');
    setPnmlBlob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/convert', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    setPnmlBlob(blob);
    const text = await blob.text();
    setPnmlContent(text);
  };

  const handleDownload = () => {
    if (!pnmlBlob) return;
    const url = URL.createObjectURL(pnmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace('.bpmn', '.pnml');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="centered">
      <h1>Transformation de Model BPMN</h1>
      <p className="subtitle">Choisissez un fichier d’extension <b>BPMN</b></p>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "2rem", justifyContent: "center", alignItems: "center", margin: "2rem 0" }}>
        <label className="custom-file-upload">
          <input type="file" accept=".bpmn" onChange={handleFileChange} />
          <span role="img" aria-label="folder">📁</span> Choisir fichier...
        </label>
        <button type="submit" className="purple-btn">Transformer</button>
      </form>
      {pnmlContent && (
        <div style={{ width: "100%", maxWidth: 800, margin: "2rem auto" }}>
          <h2>Contenu PNML généré :</h2>
          <textarea style={{ width: "100%", height: 250 }} value={pnmlContent} readOnly />
          <button className="blue-btn" onClick={handleDownload} style={{ marginTop: 10 }}>
            Télécharger le fichier PNML
          </button>
        </div>
      )}
    </div>
  );
}
