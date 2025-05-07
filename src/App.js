import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';
import './App.css'; // Importing the external CSS file

export default function App() {
  const [compressedFile, setCompressedFile] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.includes('image')) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      try {
        const compressed = await imageCompression(file, options);
        setCompressedFile(URL.createObjectURL(compressed));
      } catch (err) {
        console.error(err);
      }
    } else if (file.type === 'application/pdf') {
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
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="container">
      <h2 className="header">Image and PDF Compressor</h2>
      <input type="file" onChange={handleFile} className="fileInput" />
      <div className="dropArea">
        <p>Drag and drop file here</p>
      </div>
      {compressedFile && (
        <div className="downloadLink">
          <a href={compressedFile} download="compressed_file">
            Download Compressed File
          </a>
        </div>
      )}
    </div>
  );
}
