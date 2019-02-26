const Plugin = require('powercord/Plugin');
const { open: openModal } = require('powercord/modal');
const { getOwnerInstance } = require('powercord/util');
const { inject, injectInFluxContainer, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { resolve } = require('path');

const Settings = require('./Settings');

const SpotifyPlayer = require('./SpotifyPlayer');
const commands = require('./commands');
const Modal = require('./Modal');

module.exports = class Spotify extends Plugin {
  get SpotifyPlayer () {
    return SpotifyPlayer;
  }

  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._injectModal();
    this._patchAutoPause();
    this._patchSpotifySocket();
    this._patchPremiumDialog();

    this.on('event', ev => {
      if (ev.type === 'PLAYER_STATE_CHANGED') {
        this.SpotifyPlayer.player = ev.event.state;
      }
    });

    powercord
      .pluginManager
      .get('pc-settings')
      .register(
        'pc-spotify',
        'Spotify',
        () => React.createElement(Settings, {
          settings: this.settings,
          patch: this._patchAutoPause.bind(this)
        })
      );

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, SpotifyPlayer);

      powercord
        .pluginManager
        .get('pc-commands')
        .commands
        .set(commandName, command);
    }
  }

  unload () {
    this.unloadCSS();
    this._patchAutoPause(true);
    uninject('pc-spotify-update');
    uninject('pc-spotify-premium');

    powercord.off('webSocketMessage:dealer.spotify.com', this._handler);
    powercord.pluginManager.get('pc-settings').unregister('pc-spotify');
    for (const [ commandName ] of Object.entries(commands)) {
      powercord
        .pluginManager
        .get('pc-commands')
        .unregister(commandName);
    }

    const el = document.querySelector('#powercord-spotify-modal');
    if (el) {
      el.remove();
    }
  }

  openPremiumDialog () {
    if (!document.querySelector('.powercord-spotify-premium')) {
      const PremiumDialog = getModuleByDisplayName('SpotifyPremiumUpgrade');
      openModal(() => React.createElement(PremiumDialog, { isPowercord: true }));
    }
  }

  async _injectModal () {
    const modal = React.createElement(Modal, { main: this });
    await injectInFluxContainer('pc-spotify-modal', 'Account', 'render', (args, res) => [ modal, res ]);
    getOwnerInstance(document.querySelector('.container-2Thooq')).forceUpdate();
  }

  async _patchAutoPause (revert) {
    if (this.settings.get('noAutoPause', true)) {
      const mdl = getModule([ 'SpotifyResourceTypes' ]);
      if (revert) {
        mdl.pause = mdl._pause;
      } else {
        mdl._pause = mdl.pause;
        mdl.pause = () => void 0;
      }
    }
  }

  async _patchSpotifySocket () {
    this._handler = this._handleData.bind(this);
    powercord.on('webSocketMessage:dealer.spotify.com', this._handler);

    this.emit('event', {
      type: 'PLAYER_STATE_CHANGED',
      event: {
        state: await SpotifyPlayer.getPlayer()
      }
    });
  }

  _patchPremiumDialog () {
    const PremiumDialog = getModuleByDisplayName('SpotifyPremiumUpgrade');

    inject('pc-spotify-premium', PremiumDialog.prototype, 'render', function (args, res) {
      if (this.props.isPowercord) {
        res.props.children[1].props.children[1].props.children = 'Sorry pal, looks like you aren\'t a Spotify Premium member! Premium members are able to control Spotify through Discord with Powercord\'s Spotify modal';
        res.props.children[1].props.children[1].props.className += ' powercord-spotify-premium';
      }
      return res;
    });
  }

  _handleData (data) {
    const parsedData = JSON.parse(data.data);
    const collectionReg = /hm:\/\/collection\/collection\/[\w\d]+\/json/i;
    if (parsedData.type === 'message' && parsedData.payloads) {
      if (parsedData.uri === 'wss://event') {
        for (const payload of parsedData.payloads || []) {
          for (const ev of payload.events || []) {
            this.emit('event', ev);
          }
        }
      } else if (collectionReg.test(parsedData.uri)) {
        for (let payload of parsedData.payloads || []) {
          payload = JSON.parse(payload);
          for (const item of payload.items || []) {
            this.emit('event', item);
          }
        }
      }
    }
  }
};
