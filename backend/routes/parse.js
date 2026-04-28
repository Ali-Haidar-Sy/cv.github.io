const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { parseDocx } = require('../utils/parseDocx');
const { parsePdf } = require('../utils/parsePdf');
const { parseTxt } = require('../utils/parseTxt');
const { extractStructuredData } = require('../utils/extractData');

const router = express.Router();

// Multer config - store in temp dir, memory-based
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Please upload .pdf, .docx, or .txt`));
    }
  }
});

router.post('/parse', upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  let rawText = '';

  try {
    if (ext === '.docx') {
      rawText = await parseDocx(req.file.buffer);
    } else if (ext === '.pdf') {
      rawText = await parsePdf(req.file.buffer);
    } else if (ext === '.txt') {
      rawText = parseTxt(req.file.buffer);
    }

    const structured = extractStructuredData(rawText);
    res.json({ success: true, data: structured, rawText });
  } catch (err) {
    console.error('Parse error:', err);
    res.status(500).json({ error: `Failed to parse file: ${err.message}` });
  }
});

module.exports = router;
