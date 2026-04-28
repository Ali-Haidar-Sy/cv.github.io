const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, Packer } = require('docx');

async function generateDocx(cvData, templateId) {
  const { personalInfo, experience, education, skills, certifications, projects, languages } = cvData;
  
  const name = personalInfo?.name || 'Your Name';
  const children = [];

  // --- HEADER ---
  children.push(
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 36, color: getTemplateColor(templateId) })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  // Contact line
  const contactParts = [
    personalInfo?.phone,
    personalInfo?.email,
    personalInfo?.location,
    personalInfo?.linkedin,
    personalInfo?.website
  ].filter(Boolean);
  
  if (contactParts.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
  }

  // --- SUMMARY ---
  if (personalInfo?.summary) {
    children.push(sectionHeader('PROFESSIONAL SUMMARY', templateId));
    children.push(new Paragraph({
      children: [new TextRun({ text: personalInfo.summary, size: 20 })],
      spacing: { after: 200 }
    }));
  }

  // --- EXPERIENCE ---
  if (experience?.length) {
    children.push(sectionHeader('PROFESSIONAL EXPERIENCE', templateId));
    for (const job of experience) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: job.title || '', bold: true, size: 22 }),
          new TextRun({ text: job.company ? `  |  ${job.company}` : '', size: 22, color: '444444' })
        ],
        spacing: { after: 60 }
      }));
      const dateStr = [job.startDate, job.endDate].filter(Boolean).join(' – ');
      if (dateStr || job.location) {
        children.push(new Paragraph({
          children: [new TextRun({ text: [dateStr, job.location].filter(Boolean).join('  •  '), size: 18, color: '777777', italics: true })],
          spacing: { after: 80 }
        }));
      }
      for (const bullet of (job.description || [])) {
        children.push(new Paragraph({
          children: [new TextRun({ text: bullet, size: 20 })],
          bullet: { level: 0 },
          spacing: { after: 60 }
        }));
      }
      children.push(new Paragraph({ spacing: { after: 120 } }));
    }
  }

  // --- EDUCATION ---
  if (education?.length) {
    children.push(sectionHeader('EDUCATION', templateId));
    for (const edu of education) {
      children.push(new Paragraph({
        children: [new TextRun({ text: edu.degree || '', bold: true, size: 22 })],
        spacing: { after: 60 }
      }));
      if (edu.institution) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: edu.institution, size: 20, color: '444444' }),
            edu.graduationYear ? new TextRun({ text: `  |  ${edu.graduationYear}`, size: 20, color: '777777' }) : new TextRun({ text: '' })
          ],
          spacing: { after: 60 }
        }));
      }
      if (edu.gpa) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `GPA: ${edu.gpa}`, size: 18, color: '777777' })],
          spacing: { after: 120 }
        }));
      }
    }
  }

  // --- SKILLS ---
  if (skills?.length) {
    children.push(sectionHeader('SKILLS', templateId));
    children.push(new Paragraph({
      children: [new TextRun({ text: skills.join(' • '), size: 20 })],
      spacing: { after: 200 }
    }));
  }

  // --- CERTIFICATIONS ---
  if (certifications?.length) {
    children.push(sectionHeader('CERTIFICATIONS', templateId));
    for (const cert of certifications) {
      children.push(new Paragraph({
        children: [new TextRun({ text: cert.name || cert, size: 20 })],
        bullet: { level: 0 },
        spacing: { after: 80 }
      }));
    }
  }

  // --- PROJECTS ---
  if (projects?.length) {
    children.push(sectionHeader('PROJECTS', templateId));
    for (const proj of projects) {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.name || '', bold: true, size: 22 })],
        spacing: { after: 60 }
      }));
      for (const desc of (proj.description || [])) {
        children.push(new Paragraph({
          children: [new TextRun({ text: desc, size: 20 })],
          bullet: { level: 0 },
          spacing: { after: 60 }
        }));
      }
    }
  }

  // --- LANGUAGES ---
  if (languages?.length) {
    children.push(sectionHeader('LANGUAGES', templateId));
    children.push(new Paragraph({
      children: [new TextRun({ text: languages.map(l => `${l.language}: ${l.proficiency}`).join(' • '), size: 20 })],
      spacing: { after: 200 }
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }
        }
      },
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

function sectionHeader(text, templateId) {
  const color = getTemplateColor(templateId);
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color, allCaps: true })],
    border: {
      bottom: { color, space: 1, style: BorderStyle.SINGLE, size: 6 }
    },
    spacing: { before: 240, after: 120 }
  });
}

function getTemplateColor(templateId) {
  const colors = {
    classic: '1a365d',
    modern: '0f766e',
    executive: '1e3a5f',
    creative: '7c3aed',
    minimal: '374151',
    columbia: '003087',
    stanford: '8C1515'
  };
  return colors[templateId] || '1a365d';
}

module.exports = { generateDocx };
