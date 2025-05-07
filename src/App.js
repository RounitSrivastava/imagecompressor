import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import './App.css'; // Importing the external CSS file

export default function App() {
  const [compressedFile, setCompressedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  const handleFile = async (file) => {
    if (!file) return;

    // Handle image compression
    if (file.type.includes('image')) {
      const options = {
        maxSizeMB: 4,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      try {
        const compressed = await imageCompression(file, options);
        setCompressedFile(URL.createObjectURL(compressed));
        setErrorMessage(""); // Reset error message
      } catch (err) {
        console.error(err);
        setErrorMessage("An error occurred while compressing the image.");
      }
    } 
    // Handle PDF compression
    else if (file.type === 'application/pdf') {
      // Check file size and handle accordingly
      if (file.size > 30 * 1024 * 1024) { // 30MB in bytes
        setErrorMessage("PDF file is too large. Please upload a file less than 30MB.");
        return; // Exit if the file size is above 30MB
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const newPdfDoc = await PDFDocument.create();

        for (const page of await pdfDoc.getPages()) {
          const copiedPage = await newPdfDoc.copyPages(pdfDoc, [pdfDoc.getPageIndex(page)]);
          newPdfDoc.addPage(copiedPage[0]);
        }

        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setCompressedFile(URL.createObjectURL(blob));
        setErrorMessage(""); // Reset error message
      } catch (err) {
        console.error(err);
        setErrorMessage("An error occurred while compressing the PDF.");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // Optionally, add visual feedback when the file is dragged over the drop area
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="container">
      <h2 className="header">Image and PDF Compressor</h2>
      <input 
        type="file" 
        onChange={(e) => handleFile(e.target.files[0])} 
        className="fileInput" 
      />
      <div 
        className="dropArea"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p>Drag and drop file here</p>
      </div>

      {/* Display error message */}
      {errorMessage && <div className="errorMessage">{errorMessage}</div>}

      {compressedFile && !errorMessage && (
        <div className="downloadLink">
          <a href={compressedFile} download="compressed_file">
            Download Compressed File
          </a>
        </div>
      )}
    </div>
  );
}
