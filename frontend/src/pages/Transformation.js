import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Transformation.css";

export default function Transformation() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileId, setFileId] = useState(null);
  const [petriImage, setPetriImage] = useState("");
  const [loadingDraw, setLoadingDraw] = useState(false);
  const [zoom, setZoom] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fileDataUrl = sessionStorage.getItem("selectedBpmnFile");
    const name = sessionStorage.getItem("selectedBpmnFileName");

    if (fileDataUrl && name) {
      setFileName(name);
      const base64 = fileDataUrl.split(",")[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const fileObj = new File([byteArray], name, { type: "application/xml" });
      setFile(fileObj);
    } else {
      setFile(null);
      navigate("/");
    }
  }, [navigate]);

  const uploadFile = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      alert("Erreur lors de l'upload du fichier");
      return null;
    }
    const data = await res.json();
    return data.id;
  };

  const handleDownloadNet = async () => {
    try {
      let id = fileId;
      if (!id) {
        id = await uploadFile();
        if (!id) return;
        setFileId(id);
      }
      const url = `http://localhost:8000/download-net/${id}`;
      // Ouverture directe du lien (téléchargement automatique)
      const a = document.createElement("a");
      a.href = url;
      a.download = "conversion_" + fileName.replace(/\.bpmn$/i, "") + ".pnml";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Erreur lors du téléchargement");
    }
  };

  const handleDrawPetri = async () => {
    try {
      setLoadingDraw(true);
      let id = fileId;
      if (!id) {
        id = await uploadFile();
        if (!id) {
          setLoadingDraw(false);
          return;
        }
        setFileId(id);
      }
      const res = await fetch(`http://localhost:8000/draw-petri/${id}`);
      if (!res.ok) {
        alert("Erreur lors du dessin du graphe");
        setLoadingDraw(false);
        return;
      }
      const data = await res.json();
      setPetriImage(data.image_url);
      setLoadingDraw(false);
    } catch {
      alert("Erreur lors du dessin du graphe");
      setLoadingDraw(false);
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 2)); // Jusqu'à 200%
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5)); // Minimum 50%

  return (
    <div className="transformation-container centered">
      <h1 className="transformation-main-title">Transformation et Visualisation</h1>

      <div className="button-group">
        <button
          className="btn-green"
          onClick={handleDownloadNet}
          disabled={!file}
        >
          Télécharger le fichier Petri Net (.pnml)
        </button>

        <button
          className="btn-purple"
          onClick={handleDrawPetri}
          disabled={!file || loadingDraw}
        >
          {loadingDraw ? "Chargement..." : "Dessiner le graphe Petri"}
        </button>

        <button className="btn-home" onClick={() => navigate("/")}>
          Retour à l'Accueil
        </button>
      </div>

      {petriImage && (
        <>
          <div className="zoom-controls">
            <button onClick={zoomOut}>−</button>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn}>+</button>
          </div>
          <div className="image-wrapper">
            <img
              src={petriImage}
              alt="Graphe Petri"
              className="petri-image"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
