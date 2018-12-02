const Plugin = require('ac/Plugin');
const { watch } = require('ac/util');
const { renderSync } = require('sass');
const { readdir, readFile } = require('fs').promises;

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      stage: 2
    });

    this.styleDir = `${__dirname.replace(/\\/g, '/')}/styles`;
    this.trackedFiles = [];
  }

  async update (path) {
    if (!path.match(/\.s?css$/)) {
      return;
    }
    const file = path.replace(/\\/g, '/').replace(`${this.styleDir}/`, '');
    const match = this.trackedFiles.filter(f => f.file === file || f.includes.includes(file));
    if (match.length !== 0) {
      const id = match[0].file.split('.').shift();
      document.getElementById(`aethcord-css-${id}`).innerHTML = await this.readFile(match[0].file);
    }
  }

  async loadInitialCSS () {
    const dir = await readdir(this.styleDir);
    for (const filename of dir) {
      if (!filename.match(/\.s?css$/) || filename.match(/^_.*\.scss$/)) {
        continue;
      }

      this.trackedFiles.push({
        file: filename,
        includes: []
      });
      const style = document.createElement('style');
      style.innerHTML = await this.readFile(filename);
      style.id = `aethcord-css-${filename.split('.').shift()}`;
      document.head.appendChild(style);
    }
  }

  async readFile (filename) {
    const file = await readFile(`${this.styleDir}/${filename}`);
    if (filename.endsWith('scss')) {
      const result = renderSync({
        data: file.toString(),
        includePaths: [ this.styleDir ]
      });
      this.trackedFiles.filter(f => f.file === filename)[0].includes = result.stats.includedFiles.map(e => e.split('/').pop());
      return result.css.toString();
    }
    return file.toString();
  }

  async start () {
    this.loadInitialCSS();
    watch(this.styleDir, this.update.bind(this));
  }
};
