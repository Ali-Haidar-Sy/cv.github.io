/**
 * Extract structured CV data from raw text using heuristic pattern matching
 */
function extractStructuredData(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const data = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: []
  };

  // Extract email
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) data.personalInfo.email = emailMatch[0];

  // Extract phone (various formats)
  const phoneMatch = rawText.match(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  if (phoneMatch) data.personalInfo.phone = phoneMatch[0].trim();

  // Extract LinkedIn
  const linkedinMatch = rawText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) data.personalInfo.linkedin = 'https://' + linkedinMatch[0];

  // Extract website
  const websiteMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|io|dev|net|org)(?:\/[\w-]*)?/i);
  if (websiteMatch && !websiteMatch[0].includes('linkedin')) {
    data.personalInfo.website = websiteMatch[0];
  }

  // Name is usually the first non-email, non-phone line
  for (const line of lines.slice(0, 5)) {
    if (!line.match(/[@\d]/)) {
      data.personalInfo.name = line;
      break;
    }
  }

  // Section detection
  const sectionKeywords = {
    experience: /^(work\s+)?experience|employment\s+history|professional\s+experience|career\s+history/i,
    education: /^education(al\s+background)?|academic\s+background/i,
    skills: /^(technical\s+)?skills?|core\s+competencies|expertise/i,
    summary: /^(professional\s+)?summary|objective|profile|about\s+me/i,
    certifications: /^certifications?|licenses?|credentials/i,
    projects: /^projects?|portfolio/i,
    languages: /^languages?/i
  };

  let currentSection = null;
  let currentEntry = null;
  let summaryLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let sectionFound = false;

    for (const [section, pattern] of Object.entries(sectionKeywords)) {
      if (pattern.test(line) && line.length < 60) {
        // Save previous entry
        if (currentEntry && currentSection === 'experience') {
          data.experience.push(currentEntry);
          currentEntry = null;
        } else if (currentEntry && currentSection === 'education') {
          data.education.push(currentEntry);
          currentEntry = null;
        }
        currentSection = section;
        sectionFound = true;
        break;
      }
    }

    if (sectionFound) continue;

    if (currentSection === 'summary') {
      summaryLines.push(line);
      if (summaryLines.length > 8) summaryLines.shift(); // Keep last 8 lines
    } else if (currentSection === 'experience') {
      // Detect job entries by date patterns
      const datePattern = /(\d{4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\b).*?(\d{4}|present|current)/i;
      if (datePattern.test(line)) {
        if (currentEntry) data.experience.push(currentEntry);
        // Look ahead for company/title
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        currentEntry = {
          title: prevLine && prevLine.length < 80 ? prevLine : nextLine,
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: []
        };
        const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}|\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}|\d{4}|[Pp]resent|[Cc]urrent)/);
        if (dateMatch) {
          currentEntry.startDate = dateMatch[1];
          currentEntry.endDate = dateMatch[2];
        } else {
          currentEntry.startDate = line;
        }
        // Try to find company on adjacent lines
        if (prevLine && prevLine.length < 80 && !datePattern.test(prevLine)) {
          currentEntry.company = prevLine;
          currentEntry.title = i > 1 ? lines[i - 2] : nextLine;
        } else if (nextLine && nextLine.length < 80) {
          currentEntry.company = nextLine;
        }
      } else if (currentEntry) {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          currentEntry.description.push(line.replace(/^[•\-*]\s*/, ''));
        } else if (line.length > 20 && line.length < 200) {
          currentEntry.description.push(line);
        }
      }
    } else if (currentSection === 'education') {
      const degreeKeywords = /bachelor|master|phd|doctorate|associate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|mba|b\.eng/i;
      const yearPattern = /\d{4}/;
      if (degreeKeywords.test(line) || (yearPattern.test(line) && line.length < 100)) {
        if (currentEntry) data.education.push(currentEntry);
        currentEntry = {
          degree: line,
          institution: '',
          location: '',
          graduationYear: '',
          gpa: '',
          honors: ''
        };
        const yearMatch = line.match(/\d{4}/);
        if (yearMatch) currentEntry.graduationYear = yearMatch[0];
        const gpaMatch = line.match(/GPA:?\s*([\d.]+)/i);
        if (gpaMatch) currentEntry.gpa = gpaMatch[1];
      } else if (currentEntry && !currentEntry.institution && line.length < 100) {
        currentEntry.institution = line;
      }
    } else if (currentSection === 'skills') {
      // Skills can be comma-separated, bullet points, or line by line
      const skillItems = line.split(/[,|•·]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
      data.skills.push(...skillItems);
    } else if (currentSection === 'certifications') {
      if (line.length > 3) {
        data.certifications.push({ name: line, date: '', issuer: '' });
      }
    } else if (currentSection === 'projects') {
      if (line.length > 5) {
        if (!data.projects.length || data.projects[data.projects.length - 1].description.length > 3) {
          data.projects.push({ name: line, description: [], technologies: '' });
        } else {
          data.projects[data.projects.length - 1].description.push(line);
        }
      }
    } else if (currentSection === 'languages') {
      const parts = line.split(/[:-]/).map(s => s.trim());
      if (parts.length >= 2) {
        data.languages.push({ language: parts[0], proficiency: parts[1] });
      } else if (line.length < 50) {
        data.languages.push({ language: line, proficiency: 'Proficient' });
      }
    }
  }

  // Flush last entry
  if (currentEntry && currentSection === 'experience') data.experience.push(currentEntry);
  if (currentEntry && currentSection === 'education') data.education.push(currentEntry);

  // Summary
  if (summaryLines.length) {
    data.personalInfo.summary = summaryLines.join(' ');
  }

  // Deduplicate skills
  data.skills = [...new Set(data.skills)].filter(s => s.length > 1);

  // Location (city/state pattern)
  const locationMatch = rawText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/);
  if (locationMatch) data.personalInfo.location = locationMatch[1];

  return data;
}

module.exports = { extractStructuredData };
