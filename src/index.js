const path = require('path');
const FileWatcher = require('./lib/file-watcher');
const PDFProcessor = require('./lib/pdf-processor');
const DocumentClassifier = require('./lib/document-classifier');
const PatientInfoExtractor = require('./lib/patient-info-extractor');
const config = require('./config/default.json');
const documentTypes = require('./config/document-types.json');

class DocumentProcessor {
  constructor() {
    this.fileWatcher = new FileWatcher(config);
    this.pdfProcessor = new PDFProcessor(config);
    this.documentClassifier = new DocumentClassifier(documentTypes.documentTypes);
    this.patientInfoExtractor = new PatientInfoExtractor();

    // Set up event handlers
    this.fileWatcher.on('fileDetected', this.handleNewFile.bind(this));
    this.fileWatcher.on('error', this.handleError.bind(this));
  }

  async start() {
    console.log('Starting Document Doctor...');
    await this.fileWatcher.start();
  }

  async handleNewFile(filePath) {
    try {
      console.log(`Processing new file: ${filePath}`);

      // Process the PDF and extract text
      const pdfResult = await this.pdfProcessor.processFile(filePath);
      if (!pdfResult.success) {
        throw new Error(`PDF processing failed: ${pdfResult.error}`);
      }

      // Extract patient information
      const patientInfo = await this.patientInfoExtractor.extractInfo(pdfResult.text);
      if (!patientInfo.name || !patientInfo.dob) {
        console.warn('Warning: Could not extract complete patient information');
      }

      // Classify the document
      const classification = await this.documentClassifier.classifyDocument(pdfResult.text);
      if (classification.confidence < config.patientMatching.minimumConfidence) {
        console.warn('Warning: Low confidence in document classification');
      }

      // Log the results
      console.log('Processing Results:', {
        fileName: path.basename(filePath),
        patientName: patientInfo.name,
        patientDOB: patientInfo.dob,
        documentType: classification.type,
        confidence: classification.confidence
      });

      // Mark file as processed
      this.fileWatcher.fileProcessed(filePath);

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Error:', error.message);
  }
}

// Start the application
const processor = new DocumentProcessor();
processor.start().catch(console.error);

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await processor.fileWatcher.stop();
  process.exit(0);
});
