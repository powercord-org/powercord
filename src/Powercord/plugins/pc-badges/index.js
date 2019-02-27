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
      { path: [ 'type', 'prototype' ] }
    ], function (args, res) {
      const Component = React.createElement(BadgesComponent, {
        key: 'powercord',
        user: this.props.user
      });

      if (!res.props.children.props.children[0].props.children[0].props.children[1].props.children[1]) {
        return res.props.children.props.children[0].props.children[0].props.children[1].props.children[1] = React.createElement('div', { className: 'powercord-badges' }, Component);
      }
      res.props.children.props.children[0].props.children[0].props.children[1].props.children[1].props.children.push(Component);
      return res;
    });
  }
};
