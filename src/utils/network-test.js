const fs = require('fs').promises;
const path = require('path');
const config = require('../config/default.json');

async function testNetworkAccess() {
  const testResults = {
    watchFolderAccess: false,
    processedFolderAccess: false,
    writePermission: false,
    readPermission: false
  };

  try {
    console.log('Testing network folder access...');
    
    // Test watch folder access
    await fs.access(config.watchFolder);
    testResults.watchFolderAccess = true;
    console.log('✓ Watch folder is accessible');

    // Test processed folder access
    await fs.access(config.processedFolder);
    testResults.processedFolderAccess = true;
    console.log('✓ Processed folder is accessible');

    // Test read permissions
    const files = await fs.readdir(config.watchFolder);
    testResults.readPermission = true;
    console.log(`✓ Read permission confirmed (${files.length} files found)`);

    // Test write permissions with a temporary file
    const testFile = path.join(config.processedFolder, '.test-access');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    testResults.writePermission = true;
    console.log('✓ Write permission confirmed');

    console.log('\nAll network access tests passed successfully!');
    return testResults;

  } catch (error) {
    console.error('\nNetwork access test failed:', error.message);
    console.log('\nCurrent test results:', testResults);
    throw error;
  }
}

// Run test if called directly
if (require.main === module) {
  testNetworkAccess().catch(console.error);
}

module.exports = testNetworkAccess;