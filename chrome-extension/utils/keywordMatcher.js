// ============= PRECISION KEYWORD MATCHER MODULE =============
// 95-100% keyword match scoring with Simplify-style ATS analysis
// Extracts ~40-45 high-value keywords for optimal ATS parsing

console.log('QuantumHire AI: Precision Keyword Matcher loaded');

// TF-IDF inspired keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'must', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our', 'you', 'your',
  'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'if', 'because',
  'about', 'against', 'any', 'up', 'down', 'out', 'off', 'further', 'once', 'again', 'etc',
  'job', 'role', 'position', 'candidate', 'applicant', 'company', 'work', 'working', 'experience',
  'looking', 'seeking', 'responsibilities', 'requirements', 'qualifications', 'preferred', 'required',
]);

// High-value ATS keywords categories with weights
const ATS_KEYWORD_CATEGORIES = {
  technical: {
    weight: 1.5,
    patterns: [
      /\b(python|javascript|typescript|java|c\+\+|c#|ruby|go|rust|swift|kotlin|scala|php|r)\b/gi,
      /\b(react|angular|vue|node\.?js|express|django|flask|spring|rails|laravel|\.net)\b/gi,
      /\b(aws|azure|gcp|google cloud|kubernetes|docker|terraform|jenkins|ci\/cd|devops)\b/gi,
      /\b(sql|nosql|postgresql|mysql|mongodb|redis|elasticsearch|dynamodb|cassandra)\b/gi,
      /\b(machine learning|ml|ai|artificial intelligence|deep learning|nlp|computer vision)\b/gi,
      /\b(api|rest|graphql|microservices|serverless|cloud|saas|paas|iaas)\b/gi,
      /\b(git|github|gitlab|bitbucket|jira|confluence|agile|scrum|kanban)\b/gi,
      /\b(html|css|sass|less|webpack|babel|npm|yarn|vite)\b/gi,
      /\b(tableau|power bi|looker|excel|google sheets|data visualization)\b/gi,
      /\b(figma|sketch|adobe|photoshop|illustrator|ux|ui|design systems)\b/gi,
    ]
  },
  skills: {
    weight: 1.3,
    patterns: [
      /\b(data analysis|data science|analytics|reporting|metrics|kpi)\b/gi,
      /\b(project management|product management|program management|pmp|prince2)\b/gi,
      /\b(communication|presentation|stakeholder|collaboration|cross-functional)\b/gi,
      /\b(leadership|management|mentoring|coaching|team lead)\b/gi,
      /\b(problem[ -]?solving|critical thinking|analytical|strategic)\b/gi,
      /\b(attention to detail|detail[ -]?oriented|accuracy|precision)\b/gi,
      /\b(time management|prioritization|organization|multitasking)\b/gi,
    ]
  },
  certifications: {
    weight: 1.4,
    patterns: [
      /\b(pmp|scrum master|csm|psm|aws certified|azure certified|gcp certified)\b/gi,
      /\b(cpa|cfa|six sigma|lean|itil|cissp|comptia|ccna|ccnp)\b/gi,
      /\b(google analytics|hubspot|salesforce|sap|oracle certified)\b/gi,
    ]
  },
  action_verbs: {
    weight: 1.0,
    patterns: [
      /\b(developed|designed|implemented|created|built|established|launched)\b/gi,
      /\b(managed|led|directed|supervised|coordinated|oversaw|administered)\b/gi,
      /\b(improved|increased|reduced|optimized|enhanced|streamlined|accelerated)\b/gi,
      /\b(analyzed|evaluated|assessed|reviewed|researched|investigated)\b/gi,
      /\b(collaborated|partnered|negotiated|presented|communicated|influenced)\b/gi,
    ]
  },
  industry: {
    weight: 1.2,
    patterns: [
      /\b(fintech|healthtech|edtech|e-?commerce|saas|b2b|b2c|enterprise)\b/gi,
      /\b(startup|scale-?up|fortune 500|global|international|remote)\b/gi,
      /\b(compliance|regulatory|gdpr|hipaa|sox|pci|security)\b/gi,
    ]
  }
};

// Extract keywords with TF-IDF inspired scoring
function extractKeywordsWithTFIDF(jobText, maxKeywords = 45) {
  if (!jobText) return [];
  
  const text = jobText.toLowerCase();
  const words = text.match(/\b[a-z][a-z0-9+#.-]*\b/g) || [];
  
  // Count word frequencies
  const wordFreq = {};
  const phrases = extractPhrases(text);
  
  // Add single words
  words.forEach(word => {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Add phrases (higher weight)
  phrases.forEach(phrase => {
    wordFreq[phrase] = (wordFreq[phrase] || 0) + 2;
  });
  
  // Apply ATS category weights
  const scoredKeywords = [];
  
  for (const [keyword, freq] of Object.entries(wordFreq)) {
    let score = freq;
    let category = 'general';
    
    // Check against ATS categories
    for (const [cat, config] of Object.entries(ATS_KEYWORD_CATEGORIES)) {
      for (const pattern of config.patterns) {
        if (pattern.test(keyword)) {
          score *= config.weight;
          category = cat;
          break;
        }
      }
    }
    
    scoredKeywords.push({ keyword, score, freq, category });
  }
  
  // Sort by score and return top keywords
  return scoredKeywords
    .sort((a, b) => b.score - a.score)
    .slice(0, maxKeywords);
}

// Extract common phrases (2-3 word combinations)
function extractPhrases(text) {
  const phrases = [];
  const phrasePatterns = [
    /\b(machine learning|deep learning|data science|data analysis|data engineering)\b/gi,
    /\b(project management|product management|program management|account management)\b/gi,
    /\b(cross functional|cross-functional|full stack|full-stack|front end|back end)\b/gi,
    /\b(attention to detail|problem solving|critical thinking|time management)\b/gi,
    /\b(continuous integration|continuous delivery|continuous deployment|ci cd)\b/gi,
    /\b(user experience|user interface|ui ux|ux ui|user research)\b/gi,
    /\b(business intelligence|business development|business analysis)\b/gi,
    /\b(quality assurance|qa testing|test automation|automated testing)\b/gi,
    /\b(customer success|customer support|customer service|account management)\b/gi,
    /\b(software development|software engineering|web development|mobile development)\b/gi,
    /\b(cloud computing|cloud infrastructure|cloud native|cloud services)\b/gi,
    /\b(agile methodology|scrum methodology|lean methodology|waterfall)\b/gi,
  ];
  
  for (const pattern of phrasePatterns) {
    const matches = text.match(pattern) || [];
    phrases.push(...matches.map(m => m.toLowerCase().replace(/-/g, ' ')));
  }
  
  return [...new Set(phrases)];
}

// Calculate ATS match score (Simplify-style methodology)
function calculateATSMatchScore(cvText, jobKeywords) {
  if (!cvText || !jobKeywords || jobKeywords.length === 0) {
    return { score: 0, matched: [], missing: [], breakdown: {} };
  }
  
  const cvLower = cvText.toLowerCase();
  const matched = [];
  const missing = [];
  
  // Categorize keywords by priority
  const highPriority = jobKeywords.filter(k => k.category === 'technical' || k.category === 'certifications');
  const mediumPriority = jobKeywords.filter(k => k.category === 'skills' || k.category === 'industry');
  const lowPriority = jobKeywords.filter(k => k.category === 'action_verbs' || k.category === 'general');
  
  // Check matches
  const checkMatch = (keyword) => {
    const kw = keyword.keyword.toLowerCase();
    // Check for exact match or close variations
    const patterns = [
      new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i'),
      new RegExp(`\\b${escapeRegex(kw)}s?\\b`, 'i'), // Plural
      new RegExp(`\\b${escapeRegex(kw.replace(/ /g, '-'))}\\b`, 'i'), // Hyphenated
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(cvLower)) {
        return true;
      }
    }
    return false;
  };
  
  let highMatched = 0, highTotal = highPriority.length;
  let medMatched = 0, medTotal = mediumPriority.length;
  let lowMatched = 0, lowTotal = lowPriority.length;
  
  highPriority.forEach(k => {
    if (checkMatch(k)) { matched.push({ ...k, priority: 'high' }); highMatched++; }
    else { missing.push({ ...k, priority: 'high' }); }
  });
  
  mediumPriority.forEach(k => {
    if (checkMatch(k)) { matched.push({ ...k, priority: 'medium' }); medMatched++; }
    else { missing.push({ ...k, priority: 'medium' }); }
  });
  
  lowPriority.forEach(k => {
    if (checkMatch(k)) { matched.push({ ...k, priority: 'low' }); lowMatched++; }
    else { missing.push({ ...k, priority: 'low' }); }
  });
  
  // Calculate score with weighted priorities
  const totalWeight = (highTotal * 2) + (medTotal * 1.5) + lowTotal;
  const matchedWeight = (highMatched * 2) + (medMatched * 1.5) + lowMatched;
  
  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;
  
  // Detailed breakdown
  const breakdown = {
    keywordCoverage: {
      points: 50,
      score: Math.round((matched.length / jobKeywords.length) * 50),
    },
    highPriority: {
      matched: highMatched,
      total: highTotal,
      percentage: highTotal > 0 ? Math.round((highMatched / highTotal) * 100) : 100,
    },
    mediumPriority: {
      matched: medMatched,
      total: medTotal,
      percentage: medTotal > 0 ? Math.round((medMatched / medTotal) * 100) : 100,
    },
    lowPriority: {
      matched: lowMatched,
      total: lowTotal,
      percentage: lowTotal > 0 ? Math.round((lowMatched / lowTotal) * 100) : 100,
    },
    totalMatched: matched.length,
    totalKeywords: jobKeywords.length,
  };
  
  return { score, matched, missing, breakdown };
}

// Escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Predict match score before generating CV
function predictMatchScore(jobText, userSkills = []) {
  const jobKeywords = extractKeywordsWithTFIDF(jobText, 40);
  
  // Create a mock CV text from user skills
  const skillsText = userSkills.map(s => typeof s === 'string' ? s : s.name || '').join(' ');
  
  return calculateATSMatchScore(skillsText, jobKeywords);
}

// Generate keyword suggestions for CV sections
function generateKeywordSuggestions(missingKeywords, maxPerSection = {
  summary: 8,
  experience: 20,
  skills: 15,
}) {
  const suggestions = {
    summary: [],
    experience: [],
    skills: [],
    profile: [],
  };
  
  // High priority goes to experience and skills
  const highPriority = missingKeywords.filter(k => k.priority === 'high');
  const mediumPriority = missingKeywords.filter(k => k.priority === 'medium');
  const lowPriority = missingKeywords.filter(k => k.priority === 'low');
  
  // Distribute keywords
  let idx = 0;
  
  // Technical skills → Skills section
  highPriority.filter(k => k.category === 'technical').slice(0, maxPerSection.skills).forEach(k => {
    suggestions.skills.push(k);
  });
  
  // Experience-related → Experience section
  [...highPriority, ...mediumPriority].filter(k => k.category === 'action_verbs' || k.category === 'skills')
    .slice(0, maxPerSection.experience).forEach(k => {
      suggestions.experience.push(k);
    });
  
  // Summary gets a mix
  [...highPriority, ...mediumPriority].slice(0, maxPerSection.summary).forEach(k => {
    if (!suggestions.skills.includes(k) && !suggestions.experience.includes(k)) {
      suggestions.summary.push(k);
    }
  });
  
  // Profile header keywords (2 max)
  suggestions.profile = highPriority.slice(0, 2);
  
  return suggestions;
}

// Natural keyword templates for CV bullet points
const KEYWORD_TEMPLATES = {
  summary: [
    "Accomplished professional skilled in {k1}, {k2}, and {k3} with proven {k4} expertise",
    "{K1}/{K2} specialist delivering {k3} solutions across {k4} environments",
    "Results-driven expert in {k1} with {k2} experience driving {k3} initiatives",
    "Dynamic {k1} professional with expertise in {k2}, {k3}, and {k4}",
  ],
  experience: [
    "Developed {k1} dashboards using {k2} and {k3} for {k4} reporting",
    "Led {k1} implementation reducing {k2} processing time by {result}%",
    "Collaborated with cross-functional teams to deliver {k1} solutions using {k2}",
    "Implemented {k1} best practices, improving {k2} by {result}%",
    "Architected and deployed {k1} infrastructure leveraging {k2} and {k3}",
    "Spearheaded {k1} initiatives that enhanced {k2} capabilities",
    "Designed and optimized {k1} workflows using {k2} methodologies",
    "Managed {k1} projects delivering {result}% improvement in {k2}",
  ],
};

// Fill template with keywords
function fillKeywordTemplate(template, keywords, result = '25') {
  let filled = template.replace('{result}', result);
  
  keywords.forEach((kw, i) => {
    const keyword = typeof kw === 'string' ? kw : kw.keyword;
    filled = filled.replace(`{k${i + 1}}`, keyword);
    filled = filled.replace(`{K${i + 1}}`, capitalize(keyword));
  });
  
  // Remove unfilled placeholders
  filled = filled.replace(/\{[kK]\d+\}/g, '').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  
  return filled;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get match status label
function getMatchStatus(score) {
  if (score >= 95) return { label: 'PERFECT', color: '#22c55e', emoji: '🎯' };
  if (score >= 85) return { label: 'EXCELLENT', color: '#10b981', emoji: '✨' };
  if (score >= 75) return { label: 'GOOD', color: '#3b82f6', emoji: '👍' };
  if (score >= 60) return { label: 'FAIR', color: '#f59e0b', emoji: '⚠️' };
  return { label: 'NEEDS WORK', color: '#ef4444', emoji: '❌' };
}

// Export for use in other modules
window.QHKeywordMatcher = {
  extractKeywordsWithTFIDF,
  calculateATSMatchScore,
  predictMatchScore,
  generateKeywordSuggestions,
  fillKeywordTemplate,
  getMatchStatus,
  KEYWORD_TEMPLATES,
  ATS_KEYWORD_CATEGORIES,
};
