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
    super();

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
    this.load('Powercord-Globals', resolve(__dirname, 'styles', 'index.scss'));

    // Load themes @todo: Use a manifest to get file
    const dir = await readdir(this.themesDir);
    for (const filename of dir) {
      if (!filename.match(/\.s?css$/) || filename.match(/^_.*\.s?css$/)) {
        continue;
      }

      const styleId = filename.split('.').shift();
      const file = resolve(this.themesDir, filename);
      const watcher = chokidar.watch(file);
      this.trackedFiles.push({
        id: `Theme-${styleId}`,
        file: file.replace(/\\/g, '/'),
        includes: [],
        watchers: [ watcher ]
      });
      await this._applyStyle(`Theme-${styleId}`, file, true);
      watcher.on('change', this.update.bind(this));
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

    const watcher = chokidar.watch(file);
    this.trackedFiles.push({
      id: styleId,
      file: file.replace(/\\/g, '/'),
      includes: [],
      watchers: [ watcher ]
    });
    await this._applyStyle(styleId, file, true);
    watcher.on('change', this.update.bind(this));
  }

  unload (styleId) {
    if (!document.getElementById(`powercord-css-${styleId}`)) {
      return this.error(`Tried to unload a non existing style! (Style ID: ${styleId})`);
    }

    this.trackedFiles.find(f => f.id === styleId).watchers.forEach(w => w.close());
    this.trackedFiles = this.trackedFiles.filter(f => f.id !== styleId);
    document.getElementById(`powercord-css-${styleId}`).remove();
  }

  // Initializing
  async update (rawFile) {
    const file = rawFile.replace(/\\/g, '/');
    const match = this.trackedFiles.find(f => f.file === file || f.includes.includes(file));
    if (match) {
      await this._applyStyle(match.id, match.file);
    }
  }

  // Internals
  async _applyStyle (styleId, file, registerWatchers) {
    // Compile scss
    let css = (await readFile(file)).toString();
    if (file.endsWith('scss')) {
      let result;
      try {
        result = await new Promise((res, rej) => {
          render({
            data: css,
            includePaths: [ dirname(file) ],
            importer: (url, prev) => {
              url = url.replace('file:///', '');
              if (existsSync(url)) {
                return { file: url };
              }

              const prevFile = prev === 'stdin' ? file : prev.replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, '');
              return {
                file: resolve(dirname(decodeURI(prevFile)), url).replace(/\\/g, '/')
              };
            }
          }, (err, compiled) => {
            if (err) {
              return rej(err);
            }
            res(compiled);
          });
        });
      } catch (e) {
        this.error(`An error occurred while loading "${file}":`, e);
        return;
      }

      const cleanFile = file.replace(/\\/g, '/');
      const includedFiles = result.stats.includedFiles.map(f => decodeURI(f).replace(/\\/g, '/'));
      if (registerWatchers) {
        const watchers = [];
        includedFiles.forEach(f => {
          const watcher = chokidar.watch(f);
          watcher.on('change', this.update.bind(this));
          watchers.push(watcher);
        });
        this.trackedFiles.find(f => f.file === cleanFile || f.includes.includes(cleanFile)).watchers.push(...watchers);
      }

      this.trackedFiles.find(f => f.file === cleanFile || f.includes.includes(cleanFile)).includes = includedFiles;
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
    const [ id, css ] = data.data || data;

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
      for (const classNameModule of classNameModules) {
        for (const className of Object.values(classNameModule)) {
          const classNameMatches = className.match(/(?:([a-z0-9]+)-([\w-]{6}))+/ig);
          if (classNameMatches) {
            classNames.push(...classNameMatches);
          }
        }
      }

      // Generate global object
      for (const className of classNames) {
        const classNameMatch = className.match(/([a-z0-9]+)-([\w-]{6})/i);
        if (!this.discordClassNames.includes(classNameMatch[1])) {
          this.discordClassNames.push(classNameMatch[1]);
        }
      }
    }
  }
};
