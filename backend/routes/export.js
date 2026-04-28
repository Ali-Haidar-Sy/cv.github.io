const express = require('express');
const { generateDocx } = require('../utils/generateDocx');
const { generatePdfHtml } = require('../utils/generatePdf');

const router = express.Router();

router.post('/export/docx', async (req, res) => {
  const { cvData, templateId } = req.body;
  if (!cvData) return res.status(400).json({ error: 'No CV data provided.' });

  try {
    const buffer = await generateDocx(cvData, templateId || 'classic');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${(cvData.personalInfo?.name || 'cv').replace(/\s+/g, '_')}_CV.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error('DOCX generation error:', err);
    res.status(500).json({ error: `Failed to generate DOCX: ${err.message}` });
  }
});

router.post('/export/pdf-html', async (req, res) => {
  const { cvData, templateId } = req.body;
  if (!cvData) return res.status(400).json({ error: 'No CV data provided.' });

  try {
    const html = generatePdfHtml(cvData, templateId || 'classic');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('PDF HTML generation error:', err);
    res.status(500).json({ error: `Failed to generate PDF HTML: ${err.message}` });
  }
});

module.exports = router;
