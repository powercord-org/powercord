const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

module.exports = class Documentation extends Plugin {
  async startPlugin () {
    if (this.settings.get('__experimental_2019-10-30', false)) {
      this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));
    }
  }

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-10-30', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental documentation, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental documentaion disabled.');
    }
    this.settings.set('__experimental_2019-10-30', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
