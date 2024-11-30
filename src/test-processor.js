const DocumentProcessor = require('./lib/document-processor');
const fs = require('fs-extra');

async function processUnprocessedDocuments() {
  const processor = new DocumentProcessor();
  const unprocessedPattern = /^[0-9_]+\.pdf$/i;

  try {
    // Get list of files
    const files = await fs.readdir(processor.watchFolder);
    const unprocessedFiles = files.filter(file => unprocessedPattern.test(file));

    console.log(`Found ${unprocessedFiles.length} unprocessed files`);

    // Process each file
    for (const file of unprocessedFiles) {
      console.log(`\nProcessing ${file}...`);
      const result = await processor.processDocument(file);
      
      if (result.success) {
        console.log('Successfully processed:');
        console.log(`- Document Type: ${result.documentType}`);
        console.log(`- Patient Name: ${result.patientName}`);
        console.log(`- New Filename: ${result.newFilename}`);
      } else {
        console.log('Failed to process:', result.error);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the processor
processUnprocessedDocuments();