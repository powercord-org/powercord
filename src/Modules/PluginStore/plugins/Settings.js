const Plugin = require('aethcord/Structures/Plugin.js');
const { watch } = require('chokidar');
const { join } = require('path');

module.exports = class Settings extends Plugin {
  constructor (main) {
    super(main, 'Settings');

    this.main = main;
    this.container = null;
    this.button = null;
    this.watcher = null;
    this.setupWatcher();
    this.fired = false;
  }

  setupWatcher () {
    const path = join(__dirname, '..', '..', 'Settings');
    watch(path)
      .on('change', () => this.unload().then(this.load.bind(this)));
  }

  async load () {
    const SettingsComponent = require('aethcord/Modules/Settings/main.jsx');
    this.container = this.createElement('div', {
      id: 'aethcord-settings-container'
    });
    document.querySelector('#app-mount').appendChild(this.container);
    Aethcord.ReactDOM.render(Aethcord.React.createElement(SettingsComponent), this.container);
    const inject = () => {
      this.fired = true;
      const [ , , buttons ] = document.querySelector('.container-iksrDt').children;
      this.button = this.createElement('div', {
        innerHTML: 'AC',
        id: 'aethcord-settings-btn',
        onclick: () => {
          console.log('oh');
          this.container.classList.add('active');
        }
      });
      buttons.appendChild(this.button);
    };

    if (this.fired) {
      inject();
    } else {
      this.main.StateWatcher.on('userContainerReady', inject);
    }
  }

  async unload () {
    // yes, I realize how dumb the next 5 lines of code are, but I want my hot-reload settings :angry:
    for (const path in require.cache) {
      if (path.includes('aethcord/src/Modules/Settings')) {
        delete require.cache[require.resolve(path)];
      }
    }

    if (this.container) this.container.remove();
    if (this.button) this.button.remove();
  }
};
