const Plugin = require('powercord/Plugin');

// Based on BBD normalizer
module.exports = class ClassNameNormalizer extends Plugin {
  constructor () {
    super({
      appMode: 'both'
    });

    this.randClassReg = /^(?!pc-)((?:[a-z]|[0-9]|-)+)-(?:[a-z]|[0-9]|-|_){6}$/i;
  }

  start () {
    this.patchModules(this._fetchAllModules());
    this.normalizeElement(document.querySelector('#app-mount'));
  }

  patchModules (modules) {
    for (const mod of modules) {
      this.patchModule(mod);
    }
  }

  patchModule (classNames) {
    for (const baseClassName in classNames) {
      const value = classNames[baseClassName];
      if (this._shouldIgnore(value)) {
        continue;
      }
      const classList = value.split(' ');
      for (const normalClass of classList) {
        const match = normalClass.match(this.randClassReg)[1];
        if (!match) {
          continue;
        } // Shouldn't ever happen since they passed the moduleFilter, but you never know
        const camelCase = match.split('-').map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join('');
        classNames[baseClassName] += ` pc-${camelCase}`;
      }
    }
  }

  normalizeElement (element) {
    if (!(element instanceof Element)) {
      return;
    }
    const classes = element.classList;
    for (let c = 0, clen = classes.length; c < clen; c++) {
      if (!this.randClassReg.test(classes[c])) {
        continue;
      }
      const match = classes[c].match(this.randClassReg)[1];
      const newClass = match.split('-').map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join('');
      element.classList.add(`pc-${newClass}`);
    }
    for (const child of element.children) {
      this.normalizeElement(child);
    }
  }

  // Module fetcher
  _fetchAllModules () {
    const modules = Object.values(require('powercord/webpack').instance.cache);
    const blacklist = [ 'displayName' ];
    let classNameModules = modules.filter(mdl => {
      if (!mdl.exports) {
        return false;
      }
      const mdlExports = Object.keys(mdl.exports).filter(r => !blacklist.includes(r));
      if (mdlExports.length === 0) {
        return false;
      }
      return mdlExports.every(prop => typeof mdl.exports[prop] === 'string');
    }).map(r => r.exports);

    classNameModules = classNameModules.filter(m => typeof m === 'object' && !Array.isArray(m));
    classNameModules = classNameModules.filter(m => !m.__esModule);
    classNameModules = classNameModules.filter(m => !!Object.keys(m).length);
    classNameModules = classNameModules.filter(m => {
      for (const baseClassName in m) {
        const value = m[baseClassName];
        if (typeof value !== 'string') {
          return false;
        }
        if (this._shouldIgnore(value)) {
          continue;
        }
        if (value.split('-').length === 1) {
          return false;
        }
        if (!this.randClassReg.test(value.split(' ')[0])) {
          return false;
        }
      }
      return true;
    });
    return classNameModules;
  }

  _shouldIgnore (value) {
    if (!isNaN(value)) {
      return true;
    }
    if (value.endsWith('px') || value.endsWith('ch') || value.endsWith('em') || value.endsWith('ms')) {
      return true;
    }
    if (value.startsWith('#') && (value.length === 7 || value.length === 4)) {
      return true;
    }
    return !!(value.includes('calc(') || value.includes('rgba'));
  }
};
