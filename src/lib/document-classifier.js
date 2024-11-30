class DocumentClassifier {
  constructor(types) {
    this.documentTypes = types;
  }

  async classifyDocument(text) {
    const scores = {};
    
    // Score each document type based on keyword matches
    for (const type of this.documentTypes) {
      scores[type.name] = this.scoreDocument(text, type.keywords);
    }

    // Get the highest scoring type
    const bestMatch = Object.entries(scores)
      .reduce((a, b) => a[1] > b[1] ? a : b);

    return {
      type: bestMatch[0],
      confidence: bestMatch[1]
    };
  }

  scoreDocument(text, keywords) {
    let score = 0;
    const lowerText = text.toLowerCase();

    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    return score / keywords.length;
  }
}

module.exports = DocumentClassifier;