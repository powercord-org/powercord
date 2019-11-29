const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip, Icons: { CodeBraces } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');

module.exports = class SDK extends Plugin {
  async startPlugin () {
    if (this.settings.get('__experimental_2019-11-29', false)) {
      this.log('Experimental SDK enabled.');
      this._addPopoutIcon();
    }
  }

  pluginWillUnload () {
    uninject('pc-sdk-icon');
  }

  async _addPopoutIcon () {
    const classes = await getModule([ 'iconWrapper', 'clickable' ]);
    const HeaderBarContainer = await getModuleByDisplayName('HeaderBarContainer');
    inject('pc-sdk-icon', HeaderBarContainer.prototype, 'renderLoggedIn', (args, res) => {
      const Switcher = React.createElement(Tooltip, {
        text: 'SDK',
        position: 'bottom'
      }, React.createElement('div', {
        className: [ classes.iconWrapper, classes.clickable ].join(' ')
      }, React.createElement(CodeBraces, {
        className: classes.icon,
        onClick: () => console.log('memes')
      })));

      if (!res.props.toolbar) {
        res.props.toolbar = Switcher;
      } else {
        res.props.toolbar.props.children.push(Switcher);
      }

      return res;
    });
  }

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-11-29', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental SDK, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental SDK disabled.');
    }
    this.settings.set('__experimental_2019-11-29', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
