const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { injectRecursive, uninject } = require('powercord/injector');
const { React, getModuleByDisplayName } = require('powercord/webpack');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchUserComponent();
  }

  unload () {
    this.unloadCSS();
    uninject('pc-badges');
  }

  async _patchUserComponent () {
    const UserProfile = await getModuleByDisplayName('UserProfile');

    injectRecursive('pc-badges', UserProfile, [
      { path: [ 'prototype' ] },
      { path: [ 'type' ] },
      { path: [ 'type', 'prototype' ] },
      { path: [ 'type' ] },
      { path: [ 'type', 'prototype' ] },
      {
        path: [ 'type', 'prototype' ],
        prop: 'renderBadges'
      }
    ], function (args, res) { // @todo: Fix for users without badges
      const Component = React.createElement(BadgesComponent, { user: this.props.user });
      console.log(res);
      if (!res) {
        return Component;
      }
      res.props.children.push(Component);
      return res;
    });
  }
};
