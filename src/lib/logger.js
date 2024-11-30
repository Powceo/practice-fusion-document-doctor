const winston = require('winston');
const path = require('path');
const fs = require('fs');

class Logger {
  constructor(config) {
    // Create logs directory if it doesn't exist
    const logDir = path.dirname(config.logging.file);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logger = winston.createLogger({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // Write to all logs with specified level
        new winston.transports.File({ filename: config.logging.file }),
        // Write all errors to a separate file
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error'
        }),
        // Console output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  logProcessingStart(filePath) {
    this.logger.info('Starting document processing', {
      file: path.basename(filePath),
      event: 'PROCESS_START'
    });
  }

  logProcessingComplete(filePath, results) {
    this.logger.info('Document processing complete', {
      file: path.basename(filePath),
      event: 'PROCESS_COMPLETE',
      results
    });
  }

  logProcessingError(filePath, error) {
    this.logger.error('Document processing error', {
      file: path.basename(filePath),
      event: 'PROCESS_ERROR',
      error: error.message,
      stack: error.stack
    });
  }

  logFileMove(originalPath, newPath) {
    this.logger.info('File moved', {
      event: 'FILE_MOVE',
      from: path.basename(originalPath),
      to: path.basename(newPath)
    });
  }

  logSystemEvent(event, details) {
    this.logger.info('System event', {
      event,
      ...details
    });
  }
}

module.exports = Logger;