class PatientInfoExtractor {
  constructor() {
    this.patterns = {
      // Date patterns for DOB
      dobPatterns: [
        /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/,  // MM/DD/YYYY or MM-DD-YYYY
        /\bDOB\s*:?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/i,  // DOB: MM/DD/YYYY
        /\bDate\s+of\s+Birth\s*:?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/i  // Date of Birth: MM/DD/YYYY
      ],
      
      // Name patterns
      namePatterns: [
        /\bName\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\b/,  // Name: FirstName LastName
        /\bPatient\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\b/,  // Patient: FirstName LastName
        /\bPt\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\b/  // Pt: FirstName LastName
      ]
    };
  }

  async extractInfo(text) {
    return {
      name: this.extractName(text),
      dob: this.extractDOB(text)
    };
  }

  extractName(text) {
    for (const pattern of this.patterns.namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  extractDOB(text) {
    for (const pattern of this.patterns.dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].replace(/DOB|Date\s+of\s+Birth|:|\s/gi, '').trim();
      }
    }
    return null;
  }
}

module.exports = PatientInfoExtractor;