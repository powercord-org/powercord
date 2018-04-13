const { readFileSync, readdirSync } = require('fs');
const { watch } = require('chokidar');
const { join, sep, isAbsolute } = require('path');

const CSSDir = join(__dirname, 'styles');

module.exports = class CSSStore {
  constructor () {
    this.parent = document.createElement('div');
    this.parent.setAttribute('id', 'aethcord-css');
    document.head.appendChild(this.parent);
    this.store = new Map();

    this.setup();
  }

  async loadStyle (filename) {
    if (!isAbsolute(filename)) {
      filename = join(CSSDir, filename);
    }

    const content = readFileSync(filename).toString();
    const id = filename
      .split(sep).pop()
      .split('.')[0];

    if (!this.store.get(filename)) {
      this.store.set(
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

  async setup () {
    readdirSync(CSSDir).map(this.loadStyle, this);
    watch(CSSDir)
      .on('change', this.loadStyle.bind(this));
  }
};
