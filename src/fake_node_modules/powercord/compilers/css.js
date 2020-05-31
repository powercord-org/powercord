const Compiler = require('./compiler');
const { readFile } = require('fs').promises;

/**
 * CSS compiler
 * @extends {Compiler}
 */
class CSS extends Compiler {
  async compile () {
    const css = await readFile(this.file, 'utf8');
    if (this.watcherEnabled) {
      this._watchFiles();
    }
    return css;
  }

  computeCacheKey () {
    return null;
  }
}

module.exports = CSS;
