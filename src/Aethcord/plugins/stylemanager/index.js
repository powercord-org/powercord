const Plugin = require('ac/Plugin');
const { readdir, readFile } = require('fs').promises;
const { watch } = require('fs');

const loadCSS = async (path) => {
  const dir = await readdir(path);
  for (const filename of dir) {
    const file = await readFile(`${path}/${filename}`);

    const style = document.createElement('style');
    style.innerHTML = file.toString();
    style.id = `aethcord-css-${filename.split('.').shift()}`;
    document.head.appendChild(style);
  }
};

const clearCSS = async () => {
  document.querySelectorAll('[id^="aethcord-css-"]').forEach((item) => {
    item.parentNode.removeChild(item);
  });
};

module.exports = class StyleManager extends Plugin {
  constructor () {
    super({
      stage: 2
    });
  }

  async start () {
    const path = `${__dirname}/styles`;
    loadCSS(path);
    watch(path, { encoding: 'utf-8' }, () => {
      clearCSS();
      loadCSS(path);
    });
  }
};

