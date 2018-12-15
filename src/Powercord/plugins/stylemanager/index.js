const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const chokidar = require('chokidar');
const { renderSync } = require('sass');
const { readdir, readFile } = require('fs').promises;
const { resolve, dirname, basename } = require('path');

module.exports = class StyleManager extends Plugin {
  constructor () {
    super();

    this.styleDir = resolve(__dirname, 'styles');
    this.trackedFiles = [];
  }

  async update (path) {
    if (!path.match(/\.s?css$/)) {
      return;
    }

    const file = basename(path);
    const match = this.trackedFiles.find(f => f.file === file || f.includes.includes(file));

    if (match) {
      const id = match.file.split('.').shift();
      this.log(`Reloading style ${id}`);
      document.getElementById(`powercord-css-${id}`).innerHTML = await this.readFile(match.file);
    }
  }

  async readFile (filename) {
    const file = await readFile(resolve(this.styleDir, filename));
    if (filename.endsWith('scss')) {
      const result = renderSync({
        data: file.toString(),
        importer: (url, prev) => ({ file: resolve(dirname(prev), url) }),
        includePaths: [ this.styleDir ]
      });

      this.trackedFiles.find(f => f.file === filename).includes = result.stats.includedFiles.map(path => basename(path));

      return result.css.toString();
    }

    return file.toString();
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

      const id = filename.split('.').shift();
      document.head.appendChild(
        createElement('style', {
          innerHTML: await this.readFile(filename),
          id: `powercord-css-${id}`,
        })
      );

      this.log(`Style ${id} applied`);
    }
  }

  async start () {
    chokidar
      .watch(this.styleDir)
      .on('change', this.update.bind(this));
    this.loadInitialCSS();
  }
};
