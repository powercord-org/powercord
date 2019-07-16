window.ReactBeautifulDnd = require('./lib/react-beautiful-dnd');

const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { ContextMenu: { Button } } = require('powercord/components');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject, injectInFluxContainer, uninject } = require('powercord/injector');
const { getOwnerInstance, waitFor, sleep, forceUpdateElement } = require('powercord/util');
const { closeAll: closeModals, open: openModal, close: closeModal } = require('powercord/modal');

const GuildStore = require('./store');
const Guilds = require('./components/Guilds.jsx');
const CreateFolder = require('./components/CreateFolder.jsx');
const NewFolderModal = require('./components/FolderModal.jsx');

module.exports = class GuildFolders extends Plugin {
  constructor () {
    super();
    this.store = new GuildStore(this.settings);
  }

  async startPlugin () {
    /*
    await this.store.init();

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuilds();
    // this._patchAddGuild();
    this._patchContextMenu();

    // Ensure new guild component is immediately displayed
    getOwnerInstance(await waitFor('.pc-layer > .pc-flex > .pc-wrapper')).forceUpdate();
    // @todo: Don't use .pc-
    */
  }

  pluginWillUnload () {
    uninject('pc-guilds');
    uninject('pc-guilds-add');
    uninject('pc-guilds-add-mount');
    uninject('pc-guilds-add-update');
    uninject('pc-guilds-context');

    // @todo: Don't use .pc-
    forceUpdateElement('.pc-layer > .pc-flex > .pc-wrapper');
  }

  openCreateFolderModal () {
    closeModals();
    openModal(() => React.createElement(NewFolderModal, {
      onConfirm: (name, icon) => {
        this.store.createFolder(name, icon);
        closeModal();
      },
      onCancel: () => {
        closeModal();
      }
    }));
  }

  async _patchGuilds () {
    const _this = this;

    const DGuilds = await getModuleByDisplayName('Guilds');
    inject('pc-guilds', DGuilds.prototype, 'render', function (_, res) {
      res.props.children[1].props.children[4] = React.createElement(Guilds, Object.assign({}, this.props, {
        setRef: (key, e) => this.guildRefs[key] = e,
        settings: _this.settings,
        store: _this.store
      }));
      return res;
    });
  }

  async _patchAddGuild () {
    const AddGuild = await getModuleByDisplayName('AddGuildModal');

    inject('pc-guilds-add-class', AddGuild.prototype, 'render', (_, res) => {
      res.props.className += ' pc-createGuildDialog';
      return res;
    });

    // @todo: don't use deprecated
    injectInFluxContainer('pc-guilds-add-item', 'CreateOrJoinGuildSlide', 'render', (args, res) => {
      res.props.children.props.children.push(React.createElement(CreateFolder, {
        openModal: () => this.openCreateFolderModal()
      }));
      return res;
    });
  }

  async _patchContextMenu () {
    const _this = this;
    const GuildContextMenu = await getModuleByDisplayName('GuildContextMenu');

    inject('pc-guilds-context', GuildContextMenu.prototype, 'render', function (_, res) {
      if (this.props.isPowercord) {
        res.props.children = [
          res.props.children.shift(),
          React.createElement(Button, {
            name: 'Mark All As Read',
            onClick: () => _this._markAllAsRead()
          }),
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

  async _markAllAsRead () {
    if (this.processingMark) {
      return;
    }

    this.processingMark = true;
    const acknowledger = await getModule([ 'markGuildAsRead' ]);
    const guildStore = await getModule([ 'getSortedGuilds' ]);
    const readStore = await getModule([ 'getGuildUnreadCount' ]);

    const guilds = Object.values(guildStore.getSortedGuilds()).map(g => g.guild).filter(g => readStore.hasUnread(g.id));
    await this._asyncForEach(guilds, async guild => {
      acknowledger.markGuildAsRead(guild.id);
      await sleep(1500);
    });
    this.processingMark = false;
  }

  async _asyncForEach (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array); // eslint-disable-line callback-return
    }
  }
};
