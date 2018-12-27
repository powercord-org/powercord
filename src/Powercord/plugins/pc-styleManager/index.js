const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const chokidar = require('chokidar');
const { render } = require('sass');
const { existsSync } = require('fs');
const { readdir, readFile } = require('fs').promises;
const { resolve, dirname } = require('path');

// @todo: Install and manage themes using StyleManager
module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      appMode: 'both',
      dependencies: [ 'pc-classNameNormalizer', 'pc-settings' ]
    });

    this.themesDir = resolve(__dirname, 'themes');
    this.discordClassNames = [];
    this.trackedFiles = [];
  }

  async start () {
    // Initialize worker
    this.worker = new Worker(
      window.URL.createObjectURL(
        new Blob([
          await readFile(resolve(__dirname, 'transpiler.js'))
        ])
      )
    );
    this.worker.onmessage = this._handleFinishedCompiling.bind(this);

    // Load global css
    await this.load('pc-contextMenu', resolve(__dirname, 'styles', 'contextMenu.scss'));

    // Load themes @todo: Use a manifest to get file
    const dir = await readdir(this.themesDir);
    for (const filename of dir) {
      if (!filename.match(/\.s?css$/) || filename.match(/^_.*\.s?css$/)) {
        continue;
      }

      const styleId = filename.split('.').shift();
      const file = resolve(this.themesDir, filename);
      this.trackedFiles.push({
        id: styleId,
        file,
        includes: []
      });
      await this._applyStyle(`theme-${styleId}`, file);
    }
  }

  // Styles API
  async load (styleId, file) {
    if (!styleId.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a style with an invalid ID! You can only use letters, numbers, dashes and underscores. (Style ID: ${styleId})`, file);
    }

    if (document.getElementById(`powercord-css-${styleId}`)) {
      return this.error(`Tried to register a style with an already used ID! (Style ID: ${styleId})`, file);
    }

    if (!existsSync(file)) {
      return this.error(`Tried to load a file that does not exists! (Style ID: ${styleId})`, file);
    }

    this.trackedFiles.push({
      id: styleId,
      file,
      includes: []
    });
    await this._applyStyle(styleId, file);
    chokidar.watch(file).on('change', this.update.bind(this));
  }

  // Initializing
  async update (file) {
    const match = this.trackedFiles.find(f => f.file === file || f.includes.includes(file));

    if (match) {
      await this._applyStyle(match.id, match.file);
    }
  }

  // Internals
  async _applyStyle (styleId, file) {
    // Compile scss
    let css = (await readFile(file)).toString();
    if (file.endsWith('scss')) {
      const result = await new Promise(res => {
        render({
          data: css,
          includePaths: [ dirname(file) ],
          importer: (url, prev) => ({ file: resolve(dirname(decodeURI(prev)), url).replace(/\\/g, '/') }) // Windows pls
        }, (_, compiled) => {
          res(compiled);
        });
      });

      this.trackedFiles.find(f => f.file === file || f.includes.includes(file)).includes = result.stats.includedFiles;
      css = result.css.toString();
    }

    // Compile classes
    if (css.includes('@powercordCompile')) {
      this._ensureClassNamesLoaded();
      this.worker.postMessage([ styleId, css, this.discordClassNames ]);
    } else {
      await this._handleFinishedCompiling([ styleId, css ]);
    }
  }

  async _handleFinishedCompiling (data) {
    const payload = data.data || data;
    const id = payload[0];
    const css = payload[1];

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
