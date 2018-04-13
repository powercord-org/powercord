const { readFileSync } = require('fs');
const { join, sep, isAbsolute } = require('path');

const Store = require(join(__dirname, '..', 'Structures', 'Store'));

const styleContainer = (() => {
  const div = document.createElement('div');
  div.id = 'aethcord-css-container';
  document.head.appendChild(div);

  return div;
})();

const CSSDir = join(__dirname, 'styles');

module.exports = class CSSStore extends Store {
  constructor (main) {
    super(main, CSSDir);
  }

  getIDFromPath (path) {
    return path
      .split(sep).pop()
      .split('.')[0];
  }

  async addItem (path) {
    console.log('add', path);
    const content = readFileSync(path);
    const id = this.getIDFromPath(path);

    this.store.set(
      path,
      this.parent.appendChild((() => {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(content));
        style.id = id;

        return style;
      })())
    );
  }

  async removeItem (path) {
    console.log('remove', path);
    
    this.parent.querySelector(`#${this.getIDFromPath(path)}`).remove();
  }

  get parent () {
    return styleContainer;
  }
};
