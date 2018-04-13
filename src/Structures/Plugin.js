module.exports = class Plugin {
  constructor (main, name) {
    this.main = main;
    this.name = name;
  }

  log (...args) {
    console.log(this.name, ...args);
  }

  createElement (name, props) {
    const element = document.createElement(name);
    for (const prop in props) {
      if (['style'].includes(prop)) {
        element.setAttribute(prop, props[prop]);
      } else {
        element[prop] = props[prop];
      }
    }
    return element;
  }
};
