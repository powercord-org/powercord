window.ReactBeautifulDnd = require('./lib/react-beautiful-dnd');

const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { inject, uninject } = require('powercord/injector');
const { ContextMenu: { Button } } = require('powercord/components');
const { React, ReactDOM, getModuleByDisplayName } = require('powercord/webpack');
const { createElement, getOwnerInstance, waitFor } = require('powercord/util');

const Guilds = require('./components/Guilds.jsx');
const CreateFolder = require('./components/CreateFolder.jsx');

module.exports = class GuildFolders extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuilds();
    // this._patchAddGuild();
    this._patchContextMenu();

    // Ensure new guild component is immediately displayed
    await waitFor('.pc-guilds');
    getOwnerInstance(document.querySelector('.pc-guilds')).forceUpdate();
  }

  unload () {
    this.unloadCSS();
    uninject('pc-guilds');
    uninject('pc-guilds-add');
    uninject('pc-guilds-add-mount');
    uninject('pc-guilds-add-update');
    uninject('pc-guilds-context');
  }

  async _patchGuilds () {
    const _this = this;

    const DGuilds = await getModuleByDisplayName('Guilds');
    inject('pc-guilds', DGuilds.prototype, 'render', function (_, res) {
      res.props.children[1].props.children[5] = React.createElement(Guilds, Object.assign({}, this.props, {
        setRef: (key, e) => this.guildRefs[key] = e,
        settings: _this.settings
      }));
      return res;
    });
  }

  _patchAddGuild () {
    const AddGuild = getModuleByDisplayName('AddGuildModal');

    inject('pc-guilds-add', AddGuild.prototype, 'render', (_, res) => {
      res.props.className += ' pc-createGuildDialog';
      return res;
    });

    inject('pc-guilds-add-mount', AddGuild.prototype, 'componentDidMount', () => {
      const actions = document.querySelector('.pc-createGuildDialog header + .pc-actions');

      if (actions) {
        const element = createElement('div', { id: 'powercord-create-folder' });
        ReactDOM.render(React.createElement(CreateFolder), element);
        actions.parentElement.appendChild(element);
      }
    });

    inject('pc-guilds-add-update', AddGuild.prototype, 'componentDidUpdate', () => {
      const actions = document.querySelector('.pc-createGuildDialog header + .pc-actions');
      if (actions && !document.querySelector('#powercord-create-folder')) {
        const element = createElement('div', { id: 'powercord-create-folder' });
        ReactDOM.render(React.createElement(CreateFolder), element);
        actions.parentElement.appendChild(element);
      }
    });
  }

  async _patchContextMenu () {
    const GuildContextMenu = await getModuleByDisplayName('GuildContextMenu');

    inject('pc-guilds-context', GuildContextMenu.prototype, 'render', function (_, res) {
      if (this.props.isPowercord) {
        res.props.children = [
          res.props.children.shift(),
          // React.createElement(Button, {
          //   name: 'memes',
          //   onClick: () => console.log('memes')
          // }),
          ...res.props.children,
          React.createElement(Button, {
            name: this.props.hidden ? 'Show' : 'Hide',
            seperate: true,
            onClick: () => this.props.onHide()
          })
        ];
      }
      return res;
    });
  }
};
