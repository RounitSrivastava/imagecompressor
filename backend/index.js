const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// Multer storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// 20MB file limit
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

/* ===============================
   WORD → PDF
================================ */

app.post("/word-to-pdf", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputDir = "outputs";

  const command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Conversion failed");
    }

    const outputFile =
      path.basename(inputPath, path.extname(inputPath)) + ".pdf";

    const pdfPath = path.join(outputDir, outputFile);

    res.download(pdfPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(pdfPath);
    });
  });
});

/* ===============================
   PDF → WORD
================================ */

app.post("/pdf-to-word", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const outputDir = "outputs";

  const command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to docx "${inputPath}" --outdir "${outputDir}"`;

  exec(command, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Conversion failed");
    }

    const outputFile =
      path.basename(inputPath, path.extname(inputPath)) + ".docx";

    const docxPath = path.join(outputDir, outputFile);

    res.download(docxPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(docxPath);
    });
  });
});

/* ===============================
   REEL DOWNLOADER
================================ */

app.post("/reel-download", (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).send("No URL provided");

  const outputPath = path.join(__dirname, "reel.mp4");

  const command = `"C:\\yt-dlp\\yt-dlp.exe" --ffmpeg-location "C:\\ffmpeg\\ffmpeg-8.0.1-essentials_build\\bin" --cookies-from-browser firefox -f "bv*+ba/b" --merge-output-format mp4 "${url}" -o "${outputPath}"`;

  exec(command, (err) => {
    if (err) return res.status(500).send("Reel download failed");

    if (!fs.existsSync(outputPath))
      return res.status(500).send("File not created");

    res.download(outputPath, "reel.mp4", () => {
      try {
        fs.unlinkSync(outputPath);
      } catch {}
    });
  });
});

/* =============================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend running on", PORT);
});