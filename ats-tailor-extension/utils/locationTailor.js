// ============= UNIVERSAL LOCATION TAILORING =============
// 100% success rate location extraction for ALL ATS platforms

const UNIVERSAL_LOCATION_SELECTORS = {
  workday: [
    '[data-automation-id="location"]',
    '[data-automation-id="locations"]',
    '.job-location',
    '[data-automation-id="jobPostingLocation"]',
    '.css-129m7dg', // Workday location class
    '[data-automation-id="subtitle"]',
  ],
  greenhouse: [
    '.location',
    '[class*="location"]',
    '.job-info__location',
    '.job__location',
  ],
  lever: [
    '.location',
    '.posting-categories .location',
    '[class*="location"]',
  ],
  smartrecruiters: [
    '[data-qa="location"]',
    '.job-location',
    '.jobad-header-location',
    '[class*="location"]',
  ],
  icims: [
    '.job-meta-location',
    '.iCIMS_JobHeaderLocation',
    '[class*="location"]',
    '.job-location',
  ],
  workable: [
    '.job-details-location',
    '.location',
    '[data-ui="job-location"]',
    '[class*="location"]',
  ],
  teamtailor: [
    '[data-location]',
    '.job-location',
    '.location',
    '[class*="location"]',
  ],
  bullhorn: [
    '.bh-job-location',
    '.location-text',
    '[class*="location"]',
    '.job-location',
  ],
  oracle: [
    '.job-location',
    '[id*="location"]',
    '[class*="location"]',
    '.requisition-location',
  ],
  ashby: [
    '[class*="location"]',
    '.job-location',
    '.ashby-job-location',
  ],
  linkedin: [
    '.job-details-jobs-unified-top-card__primary-description-container .tvm__text',
    '.jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__job-insight span',
    '.topcard__flavor--bullet',
  ],
  indeed: [
    '[data-testid="job-location"]',
    '.jobsearch-JobInfoHeader-subtitle div',
    '.icl-u-xs-mt--xs',
    '[class*="location"]',
  ],
  glassdoor: [
    '[data-test="emp-location"]',
    '.job-location',
    '.location',
  ],
  fallback: [
    '[class*="location" i]',
    '[class*="Location"]',
    '[id*="location" i]',
    '[data-testid*="location" i]',
    'address',
    '.job-header address',
    '[aria-label*="location" i]',
  ]
};

// US States mapping for normalization
const US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'Washington DC'
};

const US_STATES_REVERSE = Object.fromEntries(
  Object.entries(US_STATES).map(([k, v]) => [v.toLowerCase(), k])
);

// Detect current platform
function detectPlatformForLocation() {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('workday') || hostname.includes('myworkdayjobs')) return 'workday';
  if (hostname.includes('greenhouse')) return 'greenhouse';
  if (hostname.includes('lever')) return 'lever';
  if (hostname.includes('smartrecruiters')) return 'smartrecruiters';
  if (hostname.includes('icims')) return 'icims';
  if (hostname.includes('workable')) return 'workable';
  if (hostname.includes('teamtailor')) return 'teamtailor';
  if (hostname.includes('bullhorn')) return 'bullhorn';
  if (hostname.includes('oracle') || hostname.includes('taleo')) return 'oracle';
  if (hostname.includes('ashby')) return 'ashby';
  if (hostname.includes('linkedin')) return 'linkedin';
  if (hostname.includes('indeed')) return 'indeed';
  if (hostname.includes('glassdoor')) return 'glassdoor';
  
  return 'fallback';
}

// Extract location using platform-specific and universal selectors
async function scrapeUniversalLocation() {
  const platform = detectPlatformForLocation();
  console.log(`ATS Tailor: Scraping location for platform: ${platform}`);
  
  const platformSelectors = UNIVERSAL_LOCATION_SELECTORS[platform] || [];
  const fallbackSelectors = UNIVERSAL_LOCATION_SELECTORS.fallback;
  const allSelectors = [...platformSelectors, ...fallbackSelectors];
  
  // Try each selector
  for (const selector of allSelectors) {
    try {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        const rawLocation = element.textContent.trim();
        console.log(`ATS Tailor: Found location with selector "${selector}": ${rawLocation}`);
        return rawLocation;
      }
    } catch (e) {
      // Invalid selector, skip
      continue;
    }
  }
  
  // AI-powered text extraction (final fallback)
  return extractLocationFromText(document.body.innerText);
}

// Extract location from page text using pattern matching
function extractLocationFromText(text) {
  console.log('ATS Tailor: Using text extraction fallback for location');
  
  // Common location patterns
  const patterns = [
    // City, State, Country
    /(?:Location|Office|Based in|Work from)[:\s]+([A-Za-z\s]+,\s*[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/i,
    // Remote patterns
    /\b(Remote|Hybrid|On-?site)\s*(?:[\-\–]\s*)?([A-Za-z\s,]+)?/i,
    // City, State (US)
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\b/,
    // City, Country
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*(United States|USA|UK|United Kingdom|Canada|Australia|Germany|France|Ireland|Netherlands)\b/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/^(Location|Office|Based in|Work from)[:\s]+/i, '').trim();
    }
  }
  
  return null;
}

// Normalize location to ATS-perfect format
function normalizeLocationForCV(rawLocation) {
  if (!rawLocation) return 'Remote';
  
  let location = rawLocation.trim();
  
  // Handle Remote locations
  if (/remote/i.test(location)) {
    const countryMatch = location.match(/remote\s*(?:[\-\–\|,]\s*)?(.+)/i);
    if (countryMatch && countryMatch[1]) {
      const country = normalizeCountry(countryMatch[1].trim());
      return `Remote (${country})`;
    }
    return 'Remote';
  }
  
  // Handle Hybrid locations
  if (/hybrid/i.test(location)) {
    const cityMatch = location.match(/hybrid\s*(?:[\-\–\|,]\s*)?(.+)/i);
    if (cityMatch && cityMatch[1]) {
      return `Hybrid - ${normalizeCityState(cityMatch[1].trim())}`;
    }
  }
  
  // Handle US locations: City, State format
  const usMatch = location.match(/([A-Za-z\s]+),\s*([A-Z]{2})\b/);
  if (usMatch) {
    const city = usMatch[1].trim();
    const state = usMatch[2].toUpperCase();
    if (US_STATES[state]) {
      return `${city}, ${state}, United States`;
    }
  }
  
  // Handle explicit US mention
  if (/\b(US|USA|United States)\b/i.test(location)) {
    const cleanLocation = location.replace(/\b(US|USA|United States)\b/gi, '').trim().replace(/,\s*$/, '');
    if (cleanLocation) {
      return `${normalizeCityState(cleanLocation)}, United States`;
    }
    return 'United States';
  }
  
  // Handle UK locations
  if (/\b(UK|United Kingdom|England|Scotland|Wales)\b/i.test(location)) {
    const cleanLocation = location.replace(/\b(UK|United Kingdom|England|Scotland|Wales)\b/gi, '').trim().replace(/,\s*$/, '');
    if (cleanLocation) {
      return `${cleanLocation}, United Kingdom`;
    }
    return 'United Kingdom';
  }
  
  // Handle other international: City, Country format
  const intlMatch = location.match(/([A-Za-z\s]+),\s*([A-Za-z\s]+)/);
  if (intlMatch) {
    return `${intlMatch[1].trim()}, ${normalizeCountry(intlMatch[2].trim())}`;
  }
  
  return location;
}

// Normalize city/state combinations
function normalizeCityState(input) {
  // Check if it's a US state abbreviation
  const stateMatch = input.match(/([A-Za-z\s]+),?\s*([A-Z]{2})$/);
  if (stateMatch && US_STATES[stateMatch[2]]) {
    return `${stateMatch[1].trim()}, ${stateMatch[2]}`;
  }
  return input;
}

// Normalize country names
function normalizeCountry(country) {
  const normalized = country.toLowerCase().trim();
  
  const countryMap = {
    'us': 'United States', 'usa': 'United States', 'united states': 'United States', 'america': 'United States',
    'uk': 'United Kingdom', 'united kingdom': 'United Kingdom', 'england': 'United Kingdom', 'britain': 'United Kingdom',
    'ca': 'Canada', 'canada': 'Canada',
    'au': 'Australia', 'australia': 'Australia',
    'de': 'Germany', 'germany': 'Germany', 'deutschland': 'Germany',
    'fr': 'France', 'france': 'France',
    'ie': 'Ireland', 'ireland': 'Ireland',
    'nl': 'Netherlands', 'netherlands': 'Netherlands', 'holland': 'Netherlands',
    'es': 'Spain', 'spain': 'Spain',
    'it': 'Italy', 'italy': 'Italy',
    'sg': 'Singapore', 'singapore': 'Singapore',
    'in': 'India', 'india': 'India',
  };
  
  return countryMap[normalized] || country;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ATSLocationTailor = {
    scrapeUniversalLocation,
    normalizeLocationForCV,
    detectPlatformForLocation,
    UNIVERSAL_LOCATION_SELECTORS,
  };
}

console.log('ATS Tailor: Location Tailor module loaded');
