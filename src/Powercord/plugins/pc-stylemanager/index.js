const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const chokidar = require('chokidar');
const { renderSync } = require('sass');
const { existsSync } = require('fs');
const { readdir, readFile, writeFile, mkdir } = require('fs').promises;
const { resolve, dirname, basename } = require('path');

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      appMode: 'both',
      dependencies: [ 'pc-classNameNormalizer' ]
    });

    this.styleDir = resolve(__dirname, 'styles').replace(/\\/g, '/'); // Windows is retarded
    this.compiledDir = resolve(this.styleDir, '_compiled');
    this.discordClassNames = [];
    this.trackedFiles = [];
  }

  async update (path) {
    if (!path.match(/\.s?css$/)) {
      return;
    }

    const file = basename(path);
    const match = this.trackedFiles.find(f => f.file === file || f.includes.includes(file));

    if (match) {
      await this._applyFile(match.file);
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

      await this._applyFile(filename);
    }
  }

  async start () {
    chokidar
      .watch(this.styleDir)
      .on('change', this.update.bind(this));
    this.loadInitialCSS();

    this.worker = new Worker(
      window.URL.createObjectURL(
        new Blob([
          await readFile(resolve(__dirname, 'transpiler.js'))
        ])
      )
    );
    this.worker.onmessage = this._handleFinishedCompiling.bind(this);
  }

  async _applyFile (filename) {
    const fileId = filename.split('.').shift();

    // Compile scss
    let css = (await readFile(resolve(this.styleDir, filename))).toString();
    if (filename.endsWith('scss')) {
      const result = renderSync({
        data: css,
        importer: (url, prev) => ({ file: resolve(dirname(prev), url).replace(/\\/g, '/') }), // Windows pls
        includePaths: [ this.styleDir ]
      });

      this.trackedFiles.find(f => f.file === filename || f.includes.includes(filename)).includes = result.stats.includedFiles.map(path => basename(path));
      css = result.css.toString();
    }

    // Compile classes
    if (css.includes('@powercordCompile')) {
      this._ensureClassNamesLoaded();
      this.worker.postMessage([ fileId, css, this.discordClassNames ]);
    } else {
      await this._handleFinishedCompiling([ fileId, css ]);
    }
  }

  async _handleFinishedCompiling (data) {
    const payload = data.data || data;
    const id = payload[0];
    const css = payload[1];

    if (!existsSync(this.compiledDir)) {
      await mkdir(this.compiledDir);
    }
    await writeFile(resolve(this.compiledDir, `${id}.css`), css);

    if (!document.getElementById(`powercord-css-${id}`)) {
      document.head.appendChild(
        createElement('style', {
          id: `powercord-css-${id}`,
          innerHTML: css
        })
      );
      this.log(`Style ${id} applied`);
    } else {
      document.getElementById(`powercord-css-${id}`).innerHTML = css;
      this.log(`Style ${id} updated`);
    }
  }

  _ensureClassNamesLoaded () {
    if (this.discordClassNames.length === 0) {
      const classNameModules = powercord.pluginManager.get('pc-classNameNormalizer')._fetchAllModules();

      // Getting all classes
      const classNames = [];
      classNameModules.forEach(cnm => {
        Object.keys(cnm).forEach(k => {
          const className = cnm[k];
          const classNameMatches = className.match(/(?:([a-z0-9]+)-([\w-]{6}))+/ig);
          if (classNameMatches) {
            classNames.push(...classNameMatches);
          }
        });
      });

      // Generate global object
      classNames.forEach(className => {
        const classNameMatch = className.match(/([a-z0-9]+)-([\w-]{6})/i);
        if (!this.discordClassNames.includes(classNameMatch[1])) {
          this.discordClassNames.push(classNameMatch[1]);
        }
      });
    }
  }
};
