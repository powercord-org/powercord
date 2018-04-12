const { readFileSync, readdirSync } = require('fs');
const { watch } = require('chokidar');
const { join, sep, isAbsolute } = require('path');

const CSSDir = join(__dirname, 'styles');

module.exports = class CSSManager {
  constructor () {
    this.parent = document.createElement('div');
    this.parent.setAttribute('id', 'aethcord-css');
    document.head.appendChild(this.parent);
    this.styles = new Map();

    readdirSync(CSSDir).map(this.loadFile, this);
    this.setupListener();
  }

  async loadFile (filename) {
    if (!isAbsolute(filename)) {
      filename = join(CSSDir, filename);
    }

    const content = readFileSync(filename).toString();
    const id = filename
      .split(sep).pop()
      .split('.')[0];

    if (!this.styles.get(filename)) {
      this.styles.set(
        filename,
        this.parent.appendChild((() => {
          const style = document.createElement('style');
          style.appendChild(document.createTextNode(content));
          style.id = id;

          return style;
        })())
      );
    } else {
      this.parent.querySelector(`#${id}`).innerHTML = content;
    }
  }

  async setupListener () {
    watch(CSSDir)
      .on('change', this.loadFile.bind(this));
  }
};
