const stylus = require('stylus');
const Compiler = require('./compiler');
const { readFileSync } = require('fs');
const { dirname } = require('path');

/**
 * Stylus compiler
 * @extends {Compiler}
 */
class Stylus extends Compiler {
  constructor (file) {
    super(file);
    this.stylus = stylus(readFileSync(file, 'utf8'))
      .include(dirname(file));
  }

  async listFiles () {
    return [
      this.file,
      ...(this.stylus.deps())
    ];
  }

  _compile () {
    return new Promise((resolve, reject) => {
      this.stylus.render((err, css) => {
        if (err) {
          return reject(err);
        }
        resolve(css);
      });
    });
  }

  get _metadata () {
    return `sytlus ${stylus.version}`;
  }
}

module.exports = Stylus;
