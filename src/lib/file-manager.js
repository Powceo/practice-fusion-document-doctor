const path = require('path');
const fs = require('fs').promises;

class FileManager {
  constructor(config) {
    this.config = config;
  }

  isUnprocessedFile(filename) {
    const pattern = new RegExp(this.config.filePatterns.unprocessed);
    return pattern.test(filename);
  }

  generateNewFileName(documentType, patientName) {
    // Replace invalid characters
    const sanitizedName = patientName.replace(/[<>:"/\\|?*]/g, this.config.fileNaming.invalidCharReplace);
    const sanitizedType = documentType.replace(/[<>:"/\\|?*]/g, this.config.fileNaming.invalidCharReplace);
    
    return `${sanitizedType} - ${sanitizedName}.pdf`;
  }

  async moveToProcessed(originalPath, documentType, patientName) {
    const newFileName = this.generateNewFileName(documentType, patientName);
    const newPath = path.join(this.config.processedFolder, newFileName);
    
    try {
      await fs.rename(originalPath, newPath);
      console.log(`File moved and renamed: ${newPath}`);
      return newPath;
    } catch (error) {
      console.error(`Error moving file: ${error.message}`);
      throw error;
    }
  }

  async backupOriginal(filePath) {
    const backupDir = path.join(this.config.processedFolder, 'originals');
    try {
      await fs.mkdir(backupDir, { recursive: true });
      const backupPath = path.join(backupDir, path.basename(filePath));
      await fs.copyFile(filePath, backupPath);
      console.log(`Original file backed up: ${backupPath}`);
    } catch (error) {
      console.error(`Error backing up file: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FileManager;