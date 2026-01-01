// ============= ATS-PERFECT CV PDF GENERATOR MODULE =============
// Generates PDFs optimized for 95-100% ATS keyword match
// Uses location-tailored headers and keyword-optimized content

console.log('QuantumHire AI: CV Generator Module loaded');

// Load jsPDF dynamically if not available
async function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return window.jspdf.jsPDF;
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

// ATS-Optimized PDF structure constants
const PDF_CONFIG = {
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  fonts: {
    name: 'helvetica',
    header: { size: 18, style: 'bold' },
    sectionTitle: { size: 12, style: 'bold' },
    subheader: { size: 11, style: 'normal' },
    body: { size: 10, style: 'normal' },
    small: { size: 9, style: 'normal' },
  },
  lineHeight: 1.4,
  sectionSpacing: 8,
  pageWidth: 210, // A4
  pageHeight: 297,
};

// Generate ATS-Perfect CV with Location Priority
async function generateLocationTailoredCV(jobData, candidateData, options = {}) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Get normalized location
  let perfectLocation = 'Remote';
  if (window.QHLocationTailor) {
    const locationData = await window.QHLocationTailor.scrapeUniversalLocation();
    perfectLocation = locationData.normalized;
  } else if (jobData.location) {
    perfectLocation = jobData.location;
  }
  
  // Get keyword analysis
  let keywords = [];
  let matchScore = 0;
  if (window.QHKeywordMatcher && jobData.description) {
    const jobText = `${jobData.title || ''} ${jobData.description || ''} ${(jobData.requirements || []).join(' ')}`;
    keywords = window.QHKeywordMatcher.extractKeywordsWithTFIDF(jobText, 40);
    
    // Calculate current match
    const candidateText = [
      candidateData.summary || '',
      (candidateData.skills || []).join(' '),
      (candidateData.experience || []).map(e => `${e.title} ${e.description || ''}`).join(' '),
    ].join(' ');
    
    const analysis = window.QHKeywordMatcher.calculateATSMatchScore(candidateText, keywords);
    matchScore = analysis.score;
  }
  
  let y = PDF_CONFIG.margins.top;
  const contentWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
  
  // ===== HEADER SECTION (Location in Prime Position) =====
  doc.setFont(PDF_CONFIG.fonts.name, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.header.size);
  
  const fullName = `${candidateData.firstName || ''} ${candidateData.lastName || ''}`.trim() || 'Candidate Name';
  doc.text(fullName, PDF_CONFIG.margins.left, y);
  y += 7;
  
  // LOCATION - Prime position (recruiters see instant match)
  doc.setFont(PDF_CONFIG.fonts.name, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.subheader.size);
  doc.setTextColor(51, 51, 51);
  doc.text(`📍 ${perfectLocation}`, PDF_CONFIG.margins.left, y);
  y += 5;
  
  // Contact info on same line
  const contactParts = [];
  if (candidateData.email) contactParts.push(candidateData.email);
  if (candidateData.phone) contactParts.push(candidateData.phone);
  if (candidateData.linkedin) contactParts.push(candidateData.linkedin);
  
  doc.setFontSize(PDF_CONFIG.fonts.small.size);
  doc.setTextColor(80, 80, 80);
  doc.text(contactParts.join(' | '), PDF_CONFIG.margins.left, y);
  y += PDF_CONFIG.sectionSpacing;
  
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(PDF_CONFIG.margins.left, y, PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right, y);
  y += PDF_CONFIG.sectionSpacing;
  
  // ===== PROFESSIONAL SUMMARY (8 keywords target) =====
  doc.setTextColor(0, 0, 0);
  doc.setFont(PDF_CONFIG.fonts.name, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.sectionTitle.size);
  doc.text('PROFESSIONAL SUMMARY', PDF_CONFIG.margins.left, y);
  y += 5;
  
  doc.setFont(PDF_CONFIG.fonts.name, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.body.size);
  
  // Craft summary with top keywords
  let summary = candidateData.summary || '';
  if (keywords.length > 0 && window.QHKeywordMatcher) {
    const topKeywords = keywords.slice(0, 8).map(k => k.keyword);
    // Inject keywords naturally if not already present
    topKeywords.forEach(kw => {
      if (!summary.toLowerCase().includes(kw.toLowerCase())) {
        // Will be handled by AI tailoring
      }
    });
  }
  
  const summaryLines = doc.splitTextToSize(summary || 'Experienced professional with expertise in the field.', contentWidth);
  doc.text(summaryLines, PDF_CONFIG.margins.left, y);
  y += summaryLines.length * 4 + PDF_CONFIG.sectionSpacing;
  
  // ===== EXPERIENCE SECTION (20 keywords target) =====
  if (candidateData.experience && candidateData.experience.length > 0) {
    doc.setFont(PDF_CONFIG.fonts.name, 'bold');
    doc.setFontSize(PDF_CONFIG.fonts.sectionTitle.size);
    doc.text('PROFESSIONAL EXPERIENCE', PDF_CONFIG.margins.left, y);
    y += 6;
    
    for (const exp of candidateData.experience.slice(0, 4)) {
      // Check page break
      if (y > PDF_CONFIG.pageHeight - 40) {
        doc.addPage();
        y = PDF_CONFIG.margins.top;
      }
      
      // Job title and company
      doc.setFont(PDF_CONFIG.fonts.name, 'bold');
      doc.setFontSize(PDF_CONFIG.fonts.body.size);
      doc.text(`${exp.title || 'Position'}`, PDF_CONFIG.margins.left, y);
      
      doc.setFont(PDF_CONFIG.fonts.name, 'normal');
      const companyDate = `${exp.company || 'Company'} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
      doc.text(companyDate, PDF_CONFIG.margins.left, y + 4);
      y += 9;
      
      // Bullet points (3-4 per role, each ~12 words with keywords)
      const bullets = exp.bullets || exp.description?.split('\n').filter(b => b.trim()) || [];
      for (const bullet of bullets.slice(0, 4)) {
        if (y > PDF_CONFIG.pageHeight - 30) {
          doc.addPage();
          y = PDF_CONFIG.margins.top;
        }
        
        doc.setFont(PDF_CONFIG.fonts.name, 'normal');
        doc.setFontSize(PDF_CONFIG.fonts.body.size);
        
        const bulletText = `• ${bullet.replace(/^[•\-\*]\s*/, '')}`;
        const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 5);
        doc.text(bulletLines, PDF_CONFIG.margins.left + 2, y);
        y += bulletLines.length * 4 + 1;
      }
      
      y += 4;
    }
    
    y += PDF_CONFIG.sectionSpacing - 4;
  }
  
  // ===== SKILLS SECTION (15 keywords target) =====
  if (candidateData.skills && candidateData.skills.length > 0) {
    if (y > PDF_CONFIG.pageHeight - 40) {
      doc.addPage();
      y = PDF_CONFIG.margins.top;
    }
    
    doc.setFont(PDF_CONFIG.fonts.name, 'bold');
    doc.setFontSize(PDF_CONFIG.fonts.sectionTitle.size);
    doc.text('TECHNICAL SKILLS', PDF_CONFIG.margins.left, y);
    y += 6;
    
    doc.setFont(PDF_CONFIG.fonts.name, 'normal');
    doc.setFontSize(PDF_CONFIG.fonts.body.size);
    
    // Combine user skills with top job keywords
    const skillsList = candidateData.skills.map(s => typeof s === 'string' ? s : s.name || '');
    
    // Add missing high-priority keywords to skills
    if (keywords.length > 0) {
      const technicalKeywords = keywords.filter(k => k.category === 'technical').map(k => k.keyword);
      technicalKeywords.forEach(kw => {
        if (!skillsList.some(s => s.toLowerCase().includes(kw.toLowerCase()))) {
          skillsList.push(kw);
        }
      });
    }
    
    const skillsText = skillsList.slice(0, 25).join(' • ');
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillLines, PDF_CONFIG.margins.left, y);
    y += skillLines.length * 4 + PDF_CONFIG.sectionSpacing;
  }
  
  // ===== EDUCATION SECTION =====
  if (candidateData.education && candidateData.education.length > 0) {
    if (y > PDF_CONFIG.pageHeight - 30) {
      doc.addPage();
      y = PDF_CONFIG.margins.top;
    }
    
    doc.setFont(PDF_CONFIG.fonts.name, 'bold');
    doc.setFontSize(PDF_CONFIG.fonts.sectionTitle.size);
    doc.text('EDUCATION', PDF_CONFIG.margins.left, y);
    y += 6;
    
    for (const edu of candidateData.education.slice(0, 2)) {
      doc.setFont(PDF_CONFIG.fonts.name, 'bold');
      doc.setFontSize(PDF_CONFIG.fonts.body.size);
      doc.text(edu.degree || 'Degree', PDF_CONFIG.margins.left, y);
      
      doc.setFont(PDF_CONFIG.fonts.name, 'normal');
      doc.text(`${edu.school || 'Institution'} | ${edu.year || ''}`, PDF_CONFIG.margins.left, y + 4);
      y += 10;
    }
    
    y += PDF_CONFIG.sectionSpacing;
  }
  
  // ===== CERTIFICATIONS (if any) =====
  if (candidateData.certifications && candidateData.certifications.length > 0) {
    if (y > PDF_CONFIG.pageHeight - 30) {
      doc.addPage();
      y = PDF_CONFIG.margins.top;
    }
    
    doc.setFont(PDF_CONFIG.fonts.name, 'bold');
    doc.setFontSize(PDF_CONFIG.fonts.sectionTitle.size);
    doc.text('CERTIFICATIONS', PDF_CONFIG.margins.left, y);
    y += 6;
    
    doc.setFont(PDF_CONFIG.fonts.name, 'normal');
    doc.setFontSize(PDF_CONFIG.fonts.body.size);
    
    const certsList = candidateData.certifications.map(c => typeof c === 'string' ? c : c.name || '').slice(0, 5);
    doc.text(certsList.join(' | '), PDF_CONFIG.margins.left, y);
  }
  
  // Set PDF metadata with keywords
  const keywordsMeta = keywords.slice(0, 30).map(k => k.keyword).join(',');
  doc.setProperties({
    title: `${fullName} - Resume`,
    subject: `Resume for ${jobData.title || 'Position'} at ${jobData.company || 'Company'}`,
    author: fullName,
    keywords: keywordsMeta,
    creator: 'QuantumHire AI',
  });
  
  // Return as blob and base64
  const pdfBlob = doc.output('blob');
  const pdfBase64 = await blobToBase64(pdfBlob);
  
  const fileName = `${fullName.replace(/\s+/g, '_')}_Resume_${jobData.company || 'Application'}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '');
  
  return {
    success: true,
    pdf: pdfBase64.split(',')[1], // Remove data URL prefix
    blob: pdfBlob,
    fileName,
    location: perfectLocation,
    matchScore,
    keywordsIncluded: keywords.length,
  };
}

// Generate Cover Letter with location and keywords
async function generateLocationTailoredCoverLetter(jobData, candidateData, options = {}) {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Get normalized location
  let perfectLocation = 'Remote';
  if (window.QHLocationTailor) {
    const locationData = await window.QHLocationTailor.scrapeUniversalLocation();
    perfectLocation = locationData.normalized;
  } else if (jobData.location) {
    perfectLocation = jobData.location;
  }
  
  let y = PDF_CONFIG.margins.top;
  const contentWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
  
  // Header
  doc.setFont(PDF_CONFIG.fonts.name, 'bold');
  doc.setFontSize(PDF_CONFIG.fonts.header.size);
  const fullName = `${candidateData.firstName || ''} ${candidateData.lastName || ''}`.trim();
  doc.text(fullName, PDF_CONFIG.margins.left, y);
  y += 6;
  
  // Contact with location
  doc.setFont(PDF_CONFIG.fonts.name, 'normal');
  doc.setFontSize(PDF_CONFIG.fonts.body.size);
  doc.text(`${perfectLocation} | ${candidateData.email || ''} | ${candidateData.phone || ''}`, PDF_CONFIG.margins.left, y);
  y += 15;
  
  // Date
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.text(today, PDF_CONFIG.margins.left, y);
  y += 10;
  
  // Hiring Manager
  doc.text(`Hiring Manager`, PDF_CONFIG.margins.left, y);
  y += 4;
  doc.text(`${jobData.company || 'Company'}`, PDF_CONFIG.margins.left, y);
  y += 4;
  doc.text(perfectLocation, PDF_CONFIG.margins.left, y);
  y += 10;
  
  // Greeting
  doc.text(`Dear Hiring Manager,`, PDF_CONFIG.margins.left, y);
  y += 8;
  
  // Body paragraphs (use provided cover letter or generate)
  const coverContent = candidateData.coverLetter || `I am writing to express my strong interest in the ${jobData.title || 'position'} role at ${jobData.company || 'your company'}. With my background and expertise, I am confident I would be a valuable addition to your team.

My experience aligns well with the requirements of this position, and I am excited about the opportunity to contribute to ${jobData.company || 'your organization'}'s success.

I would welcome the opportunity to discuss how my skills and experience can benefit your team. Thank you for considering my application.`;
  
  const paragraphs = coverContent.split('\n\n').filter(p => p.trim());
  
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para.trim(), contentWidth);
    doc.text(lines, PDF_CONFIG.margins.left, y);
    y += lines.length * 4 + 6;
    
    if (y > PDF_CONFIG.pageHeight - 40) {
      doc.addPage();
      y = PDF_CONFIG.margins.top;
    }
  }
  
  // Closing
  y += 4;
  doc.text('Sincerely,', PDF_CONFIG.margins.left, y);
  y += 8;
  doc.setFont(PDF_CONFIG.fonts.name, 'bold');
  doc.text(fullName, PDF_CONFIG.margins.left, y);
  
  // Return as blob and base64
  const pdfBlob = doc.output('blob');
  const pdfBase64 = await blobToBase64(pdfBlob);
  
  const fileName = `${fullName.replace(/\s+/g, '_')}_CoverLetter_${jobData.company || 'Application'}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '');
  
  return {
    success: true,
    pdf: pdfBase64.split(',')[1],
    blob: pdfBlob,
    fileName,
    location: perfectLocation,
  };
}

// Helper: Convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Quick generate both PDFs
async function generateAllPDFs(jobData, candidateData, options = {}) {
  try {
    const [resumeResult, coverResult] = await Promise.all([
      generateLocationTailoredCV(jobData, candidateData, options),
      generateLocationTailoredCoverLetter(jobData, candidateData, options),
    ]);
    
    return {
      success: true,
      resume: resumeResult,
      cover: coverResult,
      location: resumeResult.location,
      matchScore: resumeResult.matchScore,
    };
  } catch (error) {
    console.error('QuantumHire AI: PDF generation error:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in other modules
window.QHCVGenerator = {
  generateLocationTailoredCV,
  generateLocationTailoredCoverLetter,
  generateAllPDFs,
  loadJsPDF,
  PDF_CONFIG,
};
