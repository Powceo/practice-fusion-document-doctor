const { PDFDocument } = require('pdf-lib');
const tesseract = require('node-tesseract-ocr');
const fs = require('fs').promises;

class PDFProcessor {
  constructor(config) {
    this.config = config;
    this.tesseractConfig = {
      lang: config.ocr.language,
      oem: 1,
      psm: 3,
    };
  }

  async processFile(filePath) {
    try {
      console.log(`Processing PDF: ${filePath}`);
      
      // Read the PDF file
      const pdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Extract text from all pages
      let extractedText = '';
      const numPages = pdfDoc.getPageCount();
      
      for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.getPage(i);
        // If PDF has searchable text
        const { text } = await page.getText();
        if (text.trim().length > 0) {
          extractedText += text + '\n';
        } else {
          // If PDF is scanned/image-based, use OCR
          const pageImage = await page.toImage();
          const ocrText = await tesseract.recognize(pageImage, this.tesseractConfig);
          extractedText += ocrText + '\n';
        }
      }

      return {
        text: extractedText,
        pageCount: numPages,
        success: true
      };

    } catch (error) {
      console.error(`Error processing PDF: ${error.message}`);
      return {
        text: '',
        pageCount: 0,
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PDFProcessor;