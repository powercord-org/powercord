module.exports = class Plugin {
  constructor (main, name) {
    this.main = main;
    this.name = name;
    this.enabled = false;
  }

  log (...args) {
    console.log(`[${this.name}]`, ...args);
  }

  toggle () {
    this.enabled
      ? this._unload()
      : this._load();
  }

  _load () {
    this.enabled = true;
    this.load();
  }

  _unload () {
    this.enabled = false;
    this.unload();
  }

  createElement (name, props) {
    const element = document.createElement(name);
    for (const prop in props) {
      if (['style', 'href'].includes(prop)) {
        element.setAttribute(prop, props[prop]);
      } else {
        element[prop] = props[prop];
      }
    }
    return element;
  }
};
