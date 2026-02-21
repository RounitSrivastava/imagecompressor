import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ImageCompressor from "./pages/ImageCompressor";
import WordToPdf from "./pages/WordToPdf";
import PdfToWord from "./pages/PdfToWord";
import EditPdf from "./pages/EditPdf";
import ReelDownloader from "./pages/ReelDownloader";
import "./App.css";

export default function App() {
  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setShowTools(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <BrowserRouter>
      <div className="wrapper">
        <nav className="navbar">
          <h3>Confique Tools</h3>

          <div className="toolsWrapper" ref={toolsRef}>
            <button className="toolsBtn" onClick={() => setShowTools(!showTools)}>
              All Tools ▾
            </button>

            {showTools && (
              <div className="megaMenu">
                <div className="menuColumn">
                  <h4>IMAGE</h4>
                  <Link to="/" className="toolItem">
                    Image Compressor
                  </Link>
                </div>
                  <div className="menuColumn">
  <h4>MEDIA</h4>
  <Link to="/reel-downloader" className="toolItem">Reel Downloader</Link>
</div>

                <div className="menuColumn">
                  <h4>PDF</h4>
                  <Link to="/word-to-pdf" className="toolItem">
                    Word to PDF
                  </Link>
                  <Link to="/pdf-to-word" className="toolItem">
                    PDF to Word
                  </Link>
                  <Link to="/edit-pdf" className="toolItem">
                    Edit PDF
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ImageCompressor />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/edit-pdf" element={<EditPdf />} />
          <Route path="/reel-downloader" element={<ReelDownloader />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}