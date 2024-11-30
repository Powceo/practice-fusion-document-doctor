const PDFProcessor = require('../lib/pdf-processor');
const DocumentClassifier = require('../lib/document-classifier');
const PatientInfoExtractor = require('../lib/patient-info-extractor');
const config = require('../config/default.json');
const documentTypes = require('../config/document-types.json');
const path = require('path');

async function testProcessor(testFilePath) {
  try {
    console.log('Starting test processing...\n');

    // Initialize components
    const pdfProcessor = new PDFProcessor(config);
    const classifier = new DocumentClassifier(documentTypes.documentTypes);
    const extractor = new PatientInfoExtractor();

    console.log(`Processing file: ${path.basename(testFilePath)}`);

    // Test PDF processing
    console.log('\nStep 1: PDF Text Extraction');
    const pdfResult = await pdfProcessor.processFile(testFilePath);
    if (!pdfResult.success) {
      throw new Error(`PDF processing failed: ${pdfResult.error}`);
    }
    console.log(`✓ Extracted ${pdfResult.text.length} characters of text`);
    console.log(`✓ Document has ${pdfResult.pageCount} pages`);

    // Test patient information extraction
    console.log('\nStep 2: Patient Information Extraction');
    const patientInfo = await extractor.extractInfo(pdfResult.text);
    console.log('Patient Information found:', {
      name: patientInfo.name || 'Not found',
      dob: patientInfo.dob || 'Not found'
    });

    // Test document classification
    console.log('\nStep 3: Document Classification');
    const classification = await classifier.classifyDocument(pdfResult.text);
    console.log('Document Classification:', {
      type: classification.type,
      confidence: `${(classification.confidence * 100).toFixed(1)}%`
    });

    return {
      success: true,
      patientInfo,
      classification,
      text: pdfResult.text.substring(0, 200) + '...' // First 200 chars for review
    };

  } catch (error) {
    console.error('Test processing failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test if called directly
if (require.main === module) {
  if (process.argv[2]) {
    testProcessor(process.argv[2]).catch(console.error);
  } else {
    console.log('Please provide a test PDF file path');
  }
}

module.exports = testProcessor;