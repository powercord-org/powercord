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
    const id = path.split('.').shift();
    const content = await readFile(`${this.styleDir}/${path}`);
    document.getElementById(`aethcord-css-${id}`).innerHTML = content.toString();
  }

  async loadInitialCSS () {
    const dir = await readdir(this.styleDir);
    for (const filename of dir) {
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
