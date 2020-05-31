const less = require('less');
const Compiler = require('./compiler');
const { readFile } = require('fs').promises;
const { dirname } = require('path');

/**
 * Less compiler
 * @extends {Compiler}
 */
class Less extends Compiler {
  async _compile () {
    const rawLess = await readFile(this.file);
    const result = await less.render(rawLess, {
      paths: [ dirname(this.file) ]
    });

    this.__importedFiles = result.imports.filter(i => !i.startsWith('http'));
    return result.css;
  }

  listFiles () {
    if (!this.__importedFiles) {
      return [ this.file ];
    }
    return [ this.file, ...this.__importedFiles ];
  }

  computeCacheKey () {
    // Crawling less is a pain, maybe later
    return null;
  }
}

module.exports = Less;
