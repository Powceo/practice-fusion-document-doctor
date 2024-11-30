const chokidar = require('chokidar');
const path = require('path');
const EventEmitter = require('events');

class FileWatcher extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.watcher = null;
    this.processingFiles = new Set();
  }

  async start() {
    console.log(`Starting file watcher on: ${this.config.watchFolder}`);
    
    const watchOptions = {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    };

    this.watcher = chokidar.watch(this.config.watchFolder, watchOptions);

    this.watcher
      .on('add', async (filePath) => {
        if (this.isValidFile(filePath) && !this.processingFiles.has(filePath)) {
          console.log(`New file detected: ${filePath}`);
          this.processingFiles.add(filePath);
          this.emit('fileDetected', filePath);
        }
      })
      .on('error', (error) => {
        console.error(`Watcher error: ${error}`);
        this.emit('error', error);
      });
  }

  isValidFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.config.supportedFileTypes.includes(ext);
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      console.log('File watcher stopped');
    }
  }

  fileProcessed(filePath) {
    this.processingFiles.delete(filePath);
  }
}

module.exports = FileWatcher;