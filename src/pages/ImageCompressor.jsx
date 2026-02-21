import React, { useState } from "react";
import imageCompression from "browser-image-compression";

export default function ImageCompressor() {
  const [file, setFile] = useState(null);

  const handleFile = async (f) => {
    const compressed = await imageCompression(f, {
      maxSizeMB: 4,
      maxWidthOrHeight: 1024,
    });

    setFile(URL.createObjectURL(compressed));
  };

  return (
    <div className="main">
      <h1>Image Compressor</h1>

      <label className="uploadBtn">
        Select Image
        <input hidden type="file" onChange={(e) => handleFile(e.target.files[0])} />
      </label>

      {file && <a href={file} download className="download">Download</a>}
    </div>
  );
}