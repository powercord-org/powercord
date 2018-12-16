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
      appMode: 'both'
    });

    this.styleDir = resolve(__dirname, 'styles').replace(/\\/g, '/'); // Windows is retarded
    this.compiledDir = resolve(this.styleDir, '_compiled');
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
          innerHTML: await this._readFile(filename),
          id: `powercord-css-${id}`
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

  async _readFile (filename) {
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
      /*
       * formatted so eslint don't cry smh
       *
       * css.match(/((?:\s|^)(?:[^}/]*?))\s*{/ig).forEach(classNameRaw => {
       * if (classNameRaw.includes('keyframes')) {
       * return;
       * }
       * const className = classNameRaw.trim();
       * let classNames = [ className ];
       * console.log(className);
       * const cnm = className.match(/(?:\[class[\^*]=["']?([a-z0-9]+)-?["']?])+/ig);
       * if (cnm) {
       * cnm.forEach(selector => {
       * selector.match(/\[class[\^*]=["']?([a-z0-9]+)-?]/ig).forEach(s => {
       * const c = s.split('=')[1].split(']')[0].replace('-', '');
       * if (this.discordClassNames[c]) {
       * classNames = this._arrayReplace(classNames, selector, this.discordClassNames[c].map(h => `.${c}-${h}`));
       * }
       * });
       * });
       * }
       * css = css.replace(className, classNames.join(', '));
       *});
       */
    }

    // Save compiled file
    if (!existsSync(this.compiledDir)) {
      await mkdir(this.compiledDir);
    }
    await writeFile(resolve(this.compiledDir, `${fileId}.css`), css);
    return css;
  }

  _ensureClassNamesLoaded () {
    if (!this.discordClassNames) {
      // Filtering modules
      const modules = Object.values(require('powercord/webpack').instance.cache);
      const blacklist = [ 'displayName' ];
      const classNameModules = modules.filter(mdl => {
        if (!mdl.exports) {
          return false;
        }
        const mdlExports = Object.keys(mdl.exports).filter(r => !blacklist.includes(r));
        if (mdlExports.length === 0) {
          return false;
        }
        return mdlExports.every(prop => typeof mdl.exports[prop] === 'string');
      }).map(r => r.exports).filter(m => typeof m === 'object');

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
      this.discordClassNames = {};
      classNames.forEach(className => {
        const classNameMatch = className.match(/([a-z0-9]+)-([\w-]{6})/i);
        if (!this.discordClassNames[classNameMatch[1]]) {
          this.discordClassNames[classNameMatch[1]] = [ classNameMatch[2] ];
        } else if (!this.discordClassNames[classNameMatch[1]].includes(classNameMatch[2])) {
          this.discordClassNames[classNameMatch[1]].push(classNameMatch[2]);
        }
      });
    }
  }

  _arrayReplace (inputs, search, replaces) {
    const replacedArray = [];
    inputs.forEach(input => {
      replaces.forEach(replace => {
        replacedArray.push(input.replace(search, replace));
      });
    });
    return replacedArray;
  }
};
