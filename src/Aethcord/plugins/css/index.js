const Plugin = require('@ac/Plugin');
const { readdir, readFile } = require('fs').promises;

module.exports = class CSS extends Plugin {
  constructor () {
    super({
      stage: 2
    });
  }

  async start () {
    const dir = await readdir(`${__dirname}/styles`);
    for (const filename of dir) {
      const file = await readFile(`${__dirname}/styles/${filename}`)
      
      const style = document.createElement('style');
      style.innerHTML = file.toString();
      style.id = `aethcord-css-${filename.split('.').shift()}`;
      document.head.appendChild(style);
    }
  }
}