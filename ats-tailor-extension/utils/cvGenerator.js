// ============= ATS-PERFECT CV & COVER LETTER GENERATOR =============
// jsPDF-based PDF generation with keyword optimization

// Load jsPDF dynamically
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      console.log('ATS Tailor: jsPDF loaded');
      resolve(window.jspdf);
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

// Generate ATS-perfect CV PDF
async function generateLocationPerfectCV(jobData, candidateData, keywordAnalysis = null) {
  const jspdf = await loadJsPDF();
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  
  // Get normalized location
  let perfectLocation = 'United States';
  if (window.ATSLocationTailor && jobData.rawLocation) {
    perfectLocation = window.ATSLocationTailor.normalizeLocationForCV(jobData.rawLocation);
  } else if (jobData.location) {
    perfectLocation = jobData.location;
  }
  
  // Get keyword suggestions if available
  let keywordSuggestions = null;
  if (window.ATSKeywordMatcher && keywordAnalysis) {
    keywordSuggestions = window.ATSKeywordMatcher.generateKeywordSuggestions(
      candidateData,
      keywordAnalysis.keywords || []
    );
  }
  
  // ATS-OPTIMIZED LAYOUT (1" margins, professional fonts)
  const margin = 25.4; // 1 inch in mm
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  
  // ============= HEADER =============
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(candidateData.name || 'Candidate Name', margin, yPos);
  yPos += 8;
  
  // LOCATION IN PRIME POSITION (Recruiter sees instant match)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`📍 ${perfectLocation}`, margin, yPos);
  yPos += 6;
  
  // Contact info line
  const contactParts = [];
  if (candidateData.email) contactParts.push(candidateData.email);
  if (candidateData.phone) contactParts.push(candidateData.phone);
  if (candidateData.linkedin) contactParts.push(candidateData.linkedin);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(contactParts.join(' | '), margin, yPos);
  yPos += 10;
  
  // ============= PROFESSIONAL SUMMARY =============
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('PROFESSIONAL SUMMARY', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let summary = candidateData.summary || '';
  
  // Enhance summary with keywords if available
  if (keywordSuggestions && keywordSuggestions.summary.length > 0) {
    const topKeywords = keywordSuggestions.summary.slice(0, 4);
    if (!summary) {
      summary = `Accomplished professional with expertise in ${topKeywords.slice(0, 2).join(', ')} and proven track record in ${topKeywords.slice(2).join(', ')}. Results-driven with experience delivering high-impact solutions.`;
    }
  }
  
  const summaryLines = doc.splitTextToSize(summary, contentWidth);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 5 + 8;
  
  // ============= EXPERIENCE =============
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
  yPos += 8;
  
  const experiences = candidateData.experience || [];
  
  experiences.forEach((exp, index) => {
    // Check page overflow
    if (yPos > 260) {
      doc.addPage();
      yPos = margin;
    }
    
    // Job title and company
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(exp.title || 'Position', margin, yPos);
    
    // Company and dates on same line, right-aligned
    doc.setFont('helvetica', 'normal');
    const dateText = exp.dates || '';
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - margin - dateWidth, yPos);
    yPos += 5;
    
    // Company name
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(exp.company || 'Company', margin, yPos);
    yPos += 6;
    
    // Bullet points
    doc.setTextColor(0, 0, 0);
    const bullets = exp.bullets || [];
    
    bullets.forEach(bullet => {
      if (yPos > 270) {
        doc.addPage();
        yPos = margin;
      }
      
      const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 5);
      doc.text(bulletLines, margin + 3, yPos);
      yPos += bulletLines.length * 4.5;
    });
    
    yPos += 4;
  });
  
  // ============= SKILLS =============
  if (yPos > 240) {
    doc.addPage();
    yPos = margin;
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('SKILLS', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let skills = candidateData.skills || [];
  
  // Add keyword suggestions to skills if available
  if (keywordSuggestions && keywordSuggestions.skills.length > 0) {
    const existingSkillsLower = skills.map(s => s.toLowerCase());
    const newSkills = keywordSuggestions.skills.filter(
      s => !existingSkillsLower.includes(s.toLowerCase())
    );
    skills = [...skills, ...newSkills.slice(0, 10)];
  }
  
  const skillsText = skills.slice(0, 20).join(' • ');
  const skillLines = doc.splitTextToSize(skillsText, contentWidth);
  doc.text(skillLines, margin, yPos);
  yPos += skillLines.length * 5 + 8;
  
  // ============= EDUCATION =============
  if (candidateData.education && candidateData.education.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('EDUCATION', margin, yPos);
    yPos += 6;
    
    candidateData.education.forEach(edu => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(edu.degree || 'Degree', margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`${edu.school || 'University'} | ${edu.year || ''}`, margin, yPos);
      yPos += 6;
    });
  }
  
  // ============= PDF METADATA (ATS boost) =============
  if (keywordAnalysis && keywordAnalysis.keywords) {
    const metaKeywords = keywordAnalysis.keywords
      .slice(0, 30)
      .map(k => k.term)
      .join(', ');
    
    doc.setProperties({
      title: `${candidateData.name} - Resume`,
      subject: jobData.title || 'Job Application',
      keywords: metaKeywords,
      creator: 'ATS Tailor Extension',
    });
  }
  
  return doc.output('blob');
}

// Generate cover letter PDF
async function generateCoverLetter(jobData, candidateData, keywordAnalysis = null) {
  const jspdf = await loadJsPDF();
  const { jsPDF } = jspdf;
  const doc = new jsPDF();
  
  // Get normalized location
  let perfectLocation = 'United States';
  if (window.ATSLocationTailor && jobData.rawLocation) {
    perfectLocation = window.ATSLocationTailor.normalizeLocationForCV(jobData.rawLocation);
  }
  
  const margin = 25.4;
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  
  // ============= HEADER =============
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(candidateData.name || 'Your Name', margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(perfectLocation, margin, yPos);
  yPos += 5;
  
  const contact = [candidateData.email, candidateData.phone].filter(Boolean).join(' | ');
  doc.text(contact, margin, yPos);
  yPos += 15;
  
  // ============= DATE =============
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.text(today, margin, yPos);
  yPos += 10;
  
  // ============= RECIPIENT =============
  doc.text('Hiring Manager', margin, yPos);
  yPos += 5;
  doc.text(jobData.company || 'Company', margin, yPos);
  yPos += 15;
  
  // ============= SALUTATION =============
  doc.text('Dear Hiring Manager,', margin, yPos);
  yPos += 10;
  
  // ============= BODY =============
  // Get top keywords for cover letter
  let topKeywords = [];
  if (keywordAnalysis && keywordAnalysis.keywords) {
    topKeywords = keywordAnalysis.keywords
      .filter(k => k.category === 'technical' || k.category === 'skills')
      .slice(0, 6)
      .map(k => k.term);
  }
  
  // Opening paragraph
  const opening = `I am writing to express my strong interest in the ${jobData.title || 'position'} role at ${jobData.company || 'your company'}. With my background in ${topKeywords.slice(0, 2).join(' and ') || 'relevant technologies'}, I am confident I can make an immediate impact on your team.`;
  
  const openingLines = doc.splitTextToSize(opening, contentWidth);
  doc.text(openingLines, margin, yPos);
  yPos += openingLines.length * 5 + 8;
  
  // Skills paragraph
  const skills = candidateData.skills || topKeywords;
  const skillsPara = `Throughout my career, I have developed expertise in ${skills.slice(0, 4).join(', ') || 'key areas'}. I have a proven track record of delivering results and collaborating effectively with cross-functional teams to achieve business objectives.`;
  
  const skillsLines = doc.splitTextToSize(skillsPara, contentWidth);
  doc.text(skillsLines, margin, yPos);
  yPos += skillsLines.length * 5 + 8;
  
  // Closing paragraph
  const closing = `I am excited about the opportunity to bring my skills and experience to ${jobData.company || 'your organization'}. I would welcome the chance to discuss how I can contribute to your team's success. Thank you for considering my application.`;
  
  const closingLines = doc.splitTextToSize(closing, contentWidth);
  doc.text(closingLines, margin, yPos);
  yPos += closingLines.length * 5 + 15;
  
  // ============= SIGNATURE =============
  doc.text('Sincerely,', margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text(candidateData.name || 'Your Name', margin, yPos);
  
  return doc.output('blob');
}

// Create download link for PDF
function downloadPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ATSCVGenerator = {
    generateLocationPerfectCV,
    generateCoverLetter,
    downloadPDF,
    loadJsPDF,
  };
}

console.log('ATS Tailor: CV Generator module loaded');
