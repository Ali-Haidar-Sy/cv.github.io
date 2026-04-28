const templates = {
  classic: {
    primaryColor: '#1a365d',
    accentColor: '#c6a355',
    fontFamily: '"Georgia", serif',
    headerBg: '#1a365d',
    headerText: '#ffffff'
  },
  modern: {
    primaryColor: '#0f766e',
    accentColor: '#f0fdf4',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerBg: '#0f766e',
    headerText: '#ffffff'
  },
  executive: {
    primaryColor: '#1e3a5f',
    accentColor: '#d4af37',
    fontFamily: '"Times New Roman", Georgia, serif',
    headerBg: '#1e3a5f',
    headerText: '#ffffff'
  },
  creative: {
    primaryColor: '#7c3aed',
    accentColor: '#ede9fe',
    fontFamily: '"Arial", sans-serif',
    headerBg: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    headerText: '#ffffff'
  },
  minimal: {
    primaryColor: '#111827',
    accentColor: '#f9fafb',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    headerBg: '#ffffff',
    headerText: '#111827'
  }
};

function generatePdfHtml(cvData, templateId) {
  const t = templates[templateId] || templates.classic;
  const { personalInfo = {}, experience = [], education = [], skills = [], certifications = [], projects = [], languages = [] } = cvData;

  const contactLine = [
    personalInfo.phone,
    personalInfo.email,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.website
  ].filter(Boolean).join(' | ');

  const isMinimal = templateId === 'minimal';
  const isCreative = templateId === 'creative';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${personalInfo.name || 'CV'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${t.fontFamily};
    font-size: 11pt;
    line-height: 1.5;
    color: #222;
    background: white;
    max-width: 850px;
    margin: 0 auto;
    padding: 0;
  }
  
  /* HEADER */
  .header {
    background: ${t.headerBg};
    color: ${t.headerText};
    padding: ${isMinimal ? '20px 40px' : '32px 40px'};
    ${isMinimal ? 'border-bottom: 3px solid ' + t.primaryColor + ';' : ''}
  }
  .header h1 {
    font-size: ${isMinimal ? '28pt' : '26pt'};
    font-weight: bold;
    color: ${t.headerText};
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .contact-info {
    font-size: 9.5pt;
    color: ${isMinimal ? '#555' : 'rgba(255,255,255,0.88)'};
    margin-top: 6px;
  }
  
  /* BODY */
  .body { 
    padding: ${isCreative ? '20px 40px' : '24px 40px'};
    ${isCreative ? 'background: linear-gradient(to bottom, #faf9ff, #ffffff);' : ''}
  }
  
  /* SECTION */
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${t.primaryColor};
    border-bottom: 2px solid ${t.primaryColor};
    padding-bottom: 4px;
    margin-bottom: 10px;
  }
  
  /* EXPERIENCE */
  .job { margin-bottom: 14px; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; }
  .job-title { font-weight: bold; font-size: 11pt; }
  .job-company { color: #444; font-size: 10.5pt; }
  .job-meta { font-size: 9.5pt; color: #777; font-style: italic; }
  .job ul { margin: 6px 0 0 18px; }
  .job ul li { margin-bottom: 3px; font-size: 10.5pt; color: #333; }
  
  /* EDUCATION */
  .edu-entry { margin-bottom: 12px; }
  .edu-degree { font-weight: bold; font-size: 11pt; }
  .edu-school { font-size: 10.5pt; color: #444; }
  .edu-meta { font-size: 9.5pt; color: #777; font-style: italic; }
  
  /* SKILLS */
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag {
    background: ${t.accentColor};
    color: ${t.primaryColor};
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 9.5pt;
    border: 1px solid ${t.primaryColor}33;
  }
  
  /* CERTIFICATIONS */
  .cert-list { list-style: none; }
  .cert-list li { font-size: 10.5pt; padding: 2px 0; }
  .cert-list li::before { content: "✓ "; color: ${t.primaryColor}; font-weight: bold; }
  
  /* PROJECTS */
  .project { margin-bottom: 12px; }
  .project-name { font-weight: bold; font-size: 11pt; }
  .project-desc { font-size: 10.5pt; color: #444; margin-top: 4px; }
  
  /* TWO-COLUMN for creative/modern templates */
  ${isCreative ? `
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  ` : ''}
  
  /* PRINT */
  @media print {
    body { max-width: none; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .skill-tag { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  
  @page { margin: 0.5in; }
</style>
</head>
<body>

<div class="header">
  <h1>${esc(personalInfo.name || 'Your Name')}</h1>
  ${personalInfo.title ? `<div style="font-size:12pt; color: ${t.headerText === '#ffffff' ? 'rgba(255,255,255,0.8)' : '#555'}; margin-top:4px;">${esc(personalInfo.title)}</div>` : ''}
  ${contactLine ? `<div class="contact-info">${esc(contactLine)}</div>` : ''}
</div>

<div class="body">
  ${personalInfo.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p style="font-size:10.5pt; color:#333; line-height:1.6;">${esc(personalInfo.summary)}</p>
  </div>` : ''}

  ${experience.length ? `
  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${experience.map(job => `
    <div class="job">
      <div class="job-header">
        <div>
          <span class="job-title">${esc(job.title || '')}</span>
          ${job.company ? `<span class="job-company"> · ${esc(job.company)}</span>` : ''}
        </div>
        <div class="job-meta">${esc([job.startDate, job.endDate].filter(Boolean).join(' – '))}</div>
      </div>
      ${job.location ? `<div class="job-meta">${esc(job.location)}</div>` : ''}
      ${job.description?.length ? `
      <ul>
        ${job.description.map(d => `<li>${esc(d)}</li>`).join('')}
      </ul>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${education.length ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${education.map(edu => `
    <div class="edu-entry">
      <div class="edu-degree">${esc(edu.degree || '')}</div>
      ${edu.institution ? `<div class="edu-school">${esc(edu.institution)}</div>` : ''}
      <div class="edu-meta">${[edu.graduationYear, edu.gpa ? 'GPA: ' + edu.gpa : '', edu.honors].filter(Boolean).join(' · ')}</div>
    </div>`).join('')}
  </div>` : ''}

  ${skills.length ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
    </div>
  </div>` : ''}

  ${certifications.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    <ul class="cert-list">
      ${certifications.map(c => `<li>${esc(c.name || c)}</li>`).join('')}
    </ul>
  </div>` : ''}

  ${projects.length ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${projects.map(p => `
    <div class="project">
      <div class="project-name">${esc(p.name || '')}</div>
      ${p.technologies ? `<div style="font-size:9.5pt; color:#666;">${esc(p.technologies)}</div>` : ''}
      <div class="project-desc">${(p.description || []).map(d => esc(d)).join('<br>')}</div>
    </div>`).join('')}
  </div>` : ''}

  ${languages.length ? `
  <div class="section">
    <div class="section-title">Languages</div>
    <p style="font-size:10.5pt;">${languages.map(l => `${esc(l.language)}: ${esc(l.proficiency)}`).join(' · ')}</p>
  </div>` : ''}
</div>

</body>
</html>`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { generatePdfHtml };
