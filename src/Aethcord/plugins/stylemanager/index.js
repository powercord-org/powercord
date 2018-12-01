const Plugin = require('ac/Plugin');
const { watch } = require('ac/util');

const { readdir, readFile } = require('fs').promises;

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      stage: 2
    });

    this.styleDir = `${__dirname}/styles`;
  }

  async update (path) {
    if (path.endsWith('~')) {
      path = path.slice(0, -1);
    }
    if (!path.endsWith('.css')) {
      return;
    }
    const id = path.split('.').shift();
    const styleElement = document.getElementById(`aethcord-css-${id}`);
    if (styleElement) {
      const content = await readFile(`${this.styleDir}/${path}`);
      styleElement.innerHTML = content.toString();
    }
  }

  async loadInitialCSS () {
    const dir = await readdir(this.styleDir);
    for (const filename of dir) {
      if (!filename.endsWith('.css')) {
        continue;
      }
      const file = await readFile(`${this.styleDir}/${filename}`);

      const style = document.createElement('style');
      style.innerHTML = file.toString();
      style.id = `aethcord-css-${filename.split('.').shift()}`;
      document.head.appendChild(style);
    }
  }

  async start () {
    this.loadInitialCSS();
    watch(this.styleDir, this.update.bind(this));
  }
};
