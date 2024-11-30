const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');

class DocumentProcessor {
  constructor() {
    this.watchFolder = '\\\\10.128.1.12\\Scans';
    this.processedFolder = '\\\\10.128.1.12\\Scans\\Processed Scans';
  }

  async processDocument(filename) {
    try {
      const filePath = path.join(this.watchFolder, filename);
      console.log(`Processing: ${filename}`);

      // Read and parse PDF
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      // Extract information
      const info = await this.extractDocumentInfo(data.text);
      
      // Generate new filename
      const newFilename = this.generateNewFilename(info);

      // Move to processed folder
      await this.moveToProcessed(filePath, newFilename);

      return {
        success: true,
        originalFile: filename,
        newFilename: newFilename,
        ...info
      };

    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
      return {
        success: false,
        error: error.message,
        originalFile: filename
      };
    }
  }

  async extractDocumentInfo(text) {
    const info = {
      documentType: 'Unknown',
      patientName: '',
      documentDate: ''
    };

    // Extract document type
    if (text.includes('Physical Therapy') || text.includes('PT Recertification')) {
      info.documentType = 'Physical Therapy';
    } else if (text.includes('Quest Diagnostics')) {
      info.documentType = 'Lab Results';
    }

    // Extract patient name - look for common patterns
    const namePatterns = [
      /Patient Name:?\s*([A-Z\s]+)/i,
      /Name:?\s*([A-Z\s]+)/i,
      /Patient:?\s*([A-Z\s]+)/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.patientName = match[1].trim();
        break;
      }
    }

    return info;
  }

  generateNewFilename(info) {
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = info.patientName.replace(/[^a-z0-9\s]/gi, '');
    return `${info.documentType} - ${sanitizedName} - ${date}.pdf`;
  }

  async moveToProcessed(originalPath, newFilename) {
    const newPath = path.join(this.processedFolder, newFilename);
    await fs.move(originalPath, newPath, { overwrite: false });
  }
}

module.exports = DocumentProcessor;