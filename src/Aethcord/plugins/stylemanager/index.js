const Plugin = require('ac/Plugin');
const { watch } = require('ac/util');
// const { render } = require('node-sass');
const { readdir, readFile } = require('fs').promises;

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      stage: 2
    });

    this.styleDir = `${__dirname}/styles`;
  }

  async update (path) {
    if (!path.match(/\.s?css$/)) {
      return;
    }
    const id = path.split(/[\\|/]/).pop().split('.').shift();
    const styleElement = document.getElementById(`aethcord-css-${id}`);
    if (styleElement) {
      styleElement.innerHTML = await this.readFile(path);
    }
  }

  async loadInitialCSS () {
    const dir = await readdir(this.styleDir);
    for (const filename of dir) {
      if (!filename.match(/\.s?css$/)) {
        continue;
      }

      const style = document.createElement('style');
      style.innerHTML = await this.readFile(`${this.styleDir}/${filename}`);
      style.id = `aethcord-css-${filename.split('.').shift()}`;
      document.head.appendChild(style);
    }
  }

  async readFile (path) {
    const file = await readFile(path);
    if (path.endsWith('scss')) {
      /*
       * return render({
       *   data: file.toString()
       * });
       */
    }
    return file.toString();
  }

  async start () {
    this.loadInitialCSS();
    watch(this.styleDir, this.update.bind(this));
  }
};
