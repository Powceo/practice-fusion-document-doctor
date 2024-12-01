const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

async function installPoppler() {
  const popplerDir = path.join(__dirname, '..', '..', 'poppler-utils');
  console.log('Creating poppler directory at:', popplerDir);
  
  // Create directory if it doesn't exist
  await fs.ensureDir(popplerDir);
  
  console.log('\nNext steps to complete installation:\n');
  console.log('1. Download the latest release from:');
  console.log('https://github.com/oschwartz10612/poppler-windows/releases/latest');
  console.log('\n2. Extract the contents to:', popplerDir);
  console.log('\n3. Add this to your system PATH:', path.join(popplerDir, 'Library', 'bin'));
  
  console.log('\nWould you like help with any of these steps?');
}

installPoppler().catch(console.error);
