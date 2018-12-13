const Plugin = require('powercord/Plugin');
const { watch } = require('powercord/util');
const { renderSync } = require('sass');
const { readdir, readFile } = require('fs').promises;
const { dirname } = require('path');

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      stage: 2,
      appMode: 'both'
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
      this.log(`Reloading style ${id}`);
      document.getElementById(`powercord-css-${id}`).innerHTML = await this.readFile(match[0].file);
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
      const id = filename.split('.').shift();
      style.id = `powercord-css-${id}`;
      document.head.appendChild(style);
      this.log(`Style ${id} applied`);
    }
  }

  async readFile (filename) {
    const file = await readFile(`${this.styleDir}/${filename}`);
    if (filename.endsWith('scss')) {
      const result = renderSync({
        data: file.toString(),
        importer: (url, prev) => ({ file: `${dirname(prev)}/${url}` }),
        includePaths: [ this.styleDir ]
      });
      this.trackedFiles.filter(f => f.file === filename)[0].includes = result.stats.includedFiles.map(e => {
        const path = e.charAt(0).toUpperCase() + e.slice(1);
        return path.replace(/\\/g, '/').replace(`${this.styleDir}/`, '');
      });
      return result.css.toString();
    }
    return file.toString();
  }

  async start () {
    this.loadInitialCSS();
    watch(this.styleDir, this.update.bind(this));
  }
};
