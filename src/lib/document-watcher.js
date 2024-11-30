// Document watching system
class DocumentWatcher {
  constructor(config) {
    this.watchFolder = config.watchFolder;
  }

  start() {
    console.log(`Starting document watcher on folder: ${this.watchFolder}`);
  }
}

module.exports = DocumentWatcher;