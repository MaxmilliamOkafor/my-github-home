// ============= SIMPLIFY-STYLE KEYWORD MATCHER =============
// 95-100% keyword match scoring for ATS optimization

// Keyword categories with weights
const KEYWORD_CATEGORIES = {
  technical: { weight: 3, examples: ['python', 'javascript', 'react', 'aws', 'docker', 'kubernetes', 'sql', 'node.js'] },
  skills: { weight: 2.5, examples: ['project management', 'data analysis', 'machine learning', 'agile', 'scrum'] },
  certifications: { weight: 2, examples: ['pmp', 'aws certified', 'google cloud', 'cissp', 'cpa'] },
  action_verbs: { weight: 1.5, examples: ['led', 'developed', 'implemented', 'managed', 'designed', 'optimized'] },
  industry: { weight: 1, examples: ['saas', 'fintech', 'healthcare', 'e-commerce', 'b2b', 'enterprise'] },
};

// Stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if', 'about', 'your', 'our',
  'their', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
  'out', 'off', 'over', 'under', 'again', 'further', 'once', 'any', 'etc', 'via',
]);

// Extract precision keywords from job description
function extractPrecisionKeywords(jobText, targetCount = 45) {
  if (!jobText || typeof jobText !== 'string') return [];
  
  const text = jobText.toLowerCase();
  const keywords = new Map();
  
  // Extract technical terms (programming languages, tools, frameworks)
  const techPatterns = [
    /\b(python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|scala|kotlin|swift|php|r)\b/gi,
    /\b(react|angular|vue|node\.?js|express|django|flask|spring|\.net|rails)\b/gi,
    /\b(aws|azure|gcp|google cloud|docker|kubernetes|k8s|terraform|jenkins|ci\/cd)\b/gi,
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra)\b/gi,
    /\b(git|github|gitlab|bitbucket|jira|confluence|slack|figma)\b/gi,
    /\b(api|rest|graphql|microservices|serverless|cloud|saas|paas)\b/gi,
    /\b(machine learning|ml|ai|deep learning|nlp|computer vision|tensorflow|pytorch)\b/gi,
    /\b(html|css|sass|less|tailwind|bootstrap|webpack|vite|npm|yarn)\b/gi,
  ];
  
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const keyword = match.toLowerCase().trim();
      if (!STOP_WORDS.has(keyword)) {
        const existing = keywords.get(keyword) || { term: match, count: 0, category: 'technical', weight: 3 };
        existing.count++;
        keywords.set(keyword, existing);
      }
    });
  });
  
  // Extract skill phrases (2-3 word combinations)
  const skillPatterns = [
    /\b(project management|product management|team leadership|data analysis)\b/gi,
    /\b(problem solving|critical thinking|communication skills|stakeholder management)\b/gi,
    /\b(agile|scrum|kanban|waterfall|lean|six sigma)\b/gi,
    /\b(cross[- ]functional|self[- ]starter|fast[- ]paced|detail[- ]oriented)\b/gi,
    /\b(strategic planning|business development|client relations|account management)\b/gi,
    /\b(user experience|ux|ui|design thinking|user research|a\/b testing)\b/gi,
    /\b(data[- ]driven|results[- ]oriented|customer[- ]focused|quality assurance)\b/gi,
  ];
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const keyword = match.toLowerCase().trim();
      const existing = keywords.get(keyword) || { term: match, count: 0, category: 'skills', weight: 2.5 };
      existing.count++;
      keywords.set(keyword, existing);
    });
  });
  
  // Extract certifications
  const certPatterns = [
    /\b(pmp|prince2|cpa|cfa|cissp|cism|aws certified|azure certified|google certified)\b/gi,
    /\b(certified|certification|certificate|licensed|accredited)\s+\w+/gi,
  ];
  
  certPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const keyword = match.toLowerCase().trim();
      if (keyword.length > 3) {
        const existing = keywords.get(keyword) || { term: match, count: 0, category: 'certifications', weight: 2 };
        existing.count++;
        keywords.set(keyword, existing);
      }
    });
  });
  
  // Extract action verbs from requirements
  const actionVerbs = [
    'led', 'developed', 'implemented', 'designed', 'managed', 'created', 'built',
    'optimized', 'improved', 'delivered', 'launched', 'established', 'executed',
    'collaborated', 'coordinated', 'analyzed', 'streamlined', 'automated', 'scaled',
    'mentored', 'trained', 'supervised', 'directed', 'architected', 'engineered',
  ];
  
  actionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = text.match(regex) || [];
    if (matches.length > 0) {
      const existing = keywords.get(verb) || { term: verb, count: 0, category: 'action_verbs', weight: 1.5 };
      existing.count += matches.length;
      keywords.set(verb, existing);
    }
  });
  
  // TF-IDF inspired scoring
  const scored = Array.from(keywords.values()).map(kw => ({
    ...kw,
    score: kw.count * kw.weight,
  }));
  
  // Sort by score and return top keywords
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, targetCount);
}

// Calculate ATS match score (Simplify-style)
function calculateATSMatchScore(cvText, jobKeywords) {
  if (!cvText || !jobKeywords || jobKeywords.length === 0) {
    return { score: 0, breakdown: {}, missing: [], found: [] };
  }
  
  const cvLower = cvText.toLowerCase();
  const found = [];
  const missing = [];
  
  // Categorize keywords by priority
  const highPriority = jobKeywords.filter(k => k.weight >= 2.5);
  const mediumPriority = jobKeywords.filter(k => k.weight >= 1.5 && k.weight < 2.5);
  const lowPriority = jobKeywords.filter(k => k.weight < 1.5);
  
  // Check each keyword
  jobKeywords.forEach(keyword => {
    const term = keyword.term.toLowerCase();
    // Check for exact or partial match
    const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
    if (regex.test(cvLower)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  });
  
  // Calculate breakdown scores
  const highFound = found.filter(k => k.weight >= 2.5).length;
  const highTotal = highPriority.length || 1;
  const medFound = found.filter(k => k.weight >= 1.5 && k.weight < 2.5).length;
  const medTotal = mediumPriority.length || 1;
  const lowFound = found.filter(k => k.weight < 1.5).length;
  const lowTotal = lowPriority.length || 1;
  
  // Weighted score calculation
  const keywordCoverageScore = Math.min(50, (found.length / jobKeywords.length) * 50);
  const missingPenalty = Math.min(20, (missing.filter(k => k.weight >= 2.5).length / highTotal) * 20);
  const experienceScore = 20; // Base score for having experience
  const technicalScore = Math.min(15, (found.filter(k => k.category === 'technical').length / 10) * 15);
  const formatScore = 15; // Base score for proper formatting
  
  const totalScore = Math.round(
    keywordCoverageScore +
    experienceScore +
    technicalScore +
    formatScore -
    missingPenalty
  );
  
  return {
    score: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      keywordCoverage: { points: 50, current: Math.round(keywordCoverageScore) },
      missingKeywords: { points: -20, current: -Math.round(missingPenalty) },
      experienceMatch: { points: 20, current: experienceScore },
      technicalAlignment: { points: 15, current: Math.round(technicalScore) },
      formatLocation: { points: 15, current: formatScore },
    },
    found,
    missing,
    stats: {
      high: { found: highFound, total: highPriority.length },
      medium: { found: medFound, total: mediumPriority.length },
      low: { found: lowFound, total: lowPriority.length },
    }
  };
}

// Get match status label
function getMatchStatus(score) {
  if (score >= 95) return { label: 'PERFECT', color: '#10b981', badge: '🎯' };
  if (score >= 85) return { label: 'EXCELLENT', color: '#22c55e', badge: '✅' };
  if (score >= 70) return { label: 'GOOD', color: '#f59e0b', badge: '📊' };
  if (score >= 50) return { label: 'NEEDS WORK', color: '#f97316', badge: '⚠️' };
  return { label: 'LOW MATCH', color: '#ef4444', badge: '❌' };
}

// Natural keyword templates for CV sections
const KEYWORD_TEMPLATES = {
  summary: [
    "Accomplished {role} professional with expertise in {k1}, {k2}, and {k3}, delivering {k4} solutions across {industry} environments.",
    "Results-driven specialist skilled in {k1} and {k2} with proven track record of {k3} excellence and {k4} leadership.",
    "{k1}/{k2} expert with {years}+ years driving {k3} initiatives and {k4} transformations.",
  ],
  experience: [
    "Developed and deployed {k1} solutions using {k2} and {k3}, improving {metric} by {percent}%",
    "Led {k1} implementation leveraging {k2}, resulting in {metric} optimization of {percent}%",
    "Architected {k1} platform utilizing {k2} and {k3} to enable {k4} capabilities",
    "Spearheaded {k1} initiatives using {k2}, driving {metric} improvements across {k3} systems",
    "Collaborated with cross-functional teams to implement {k1} using {k2} and {k3} frameworks",
    "Optimized {k1} workflows through {k2} automation, reducing {metric} by {percent}%",
  ],
  skills: [
    "{k1}", "{k2}", "{k3}", // Direct skill listing
  ],
};

// Generate keyword suggestions for each CV section
function generateKeywordSuggestions(cvSections, jobKeywords) {
  const suggestions = {
    summary: [],
    experience: [],
    skills: [],
  };
  
  // Get top keywords for each section
  const technicalKws = jobKeywords.filter(k => k.category === 'technical').slice(0, 8);
  const skillKws = jobKeywords.filter(k => k.category === 'skills').slice(0, 5);
  const actionKws = jobKeywords.filter(k => k.category === 'action_verbs').slice(0, 5);
  
  // Summary: 8 keywords
  suggestions.summary = [...technicalKws.slice(0, 4), ...skillKws.slice(0, 4)].map(k => k.term);
  
  // Experience: 20 keywords (3-4 per bullet)
  suggestions.experience = [...technicalKws, ...actionKws].map(k => k.term);
  
  // Skills: 15 keywords
  suggestions.skills = [...technicalKws, ...skillKws].slice(0, 15).map(k => k.term);
  
  return suggestions;
}

// Escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ATSKeywordMatcher = {
    extractPrecisionKeywords,
    calculateATSMatchScore,
    getMatchStatus,
    generateKeywordSuggestions,
    KEYWORD_TEMPLATES,
    KEYWORD_CATEGORIES,
  };
}

console.log('ATS Tailor: Keyword Matcher module loaded');
