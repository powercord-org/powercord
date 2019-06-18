const fs = require('fs').promises;
const { Plugin } = require('powercord/entities');
const { open: openModal } = require('powercord/modal');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { inject, injectInFluxContainer, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { resolve } = require('path');

const Settings = require('./Settings');

const SpotifyPlayer = require('./SpotifyPlayer');
const commands = require('./commands');
const Modal = require('./Modal');
const PlaylistModal = require('./Modal/PlaylistModal');

module.exports = class Spotify extends Plugin {
  get SpotifyPlayer () {
    return SpotifyPlayer;
  }

  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.containerClasses = await getModule([ 'container', 'usernameContainer' ]);
    this._injectModal();
    this._injectListeningAlong();
    this._patchAutoPause();
    this._patchSpotifySocket();
    this._patchPremiumDialog();

    this.on('event', ev => {
      if (ev.type === 'PLAYER_STATE_CHANGED') {
        this.SpotifyPlayer.player = ev.event.state;
      }
    });

    this.registerSettings('pc-spotify', 'Spotify', (props) =>
      React.createElement(Settings, {
        patch: this._patchAutoPause.bind(this),
        ...props
      })
    );

    Object.values(commands).forEach(command =>
      this.registerCommand(command.command, command.aliases || [], command.description, command.usage, command.func.bind(null, this.SpotifyPlayer))
    );
  }

  pluginWillUnload () {
    this._patchAutoPause(true);
    uninject('pc-spotify-modal');
    uninject('pc-spotify-listeningAlong');
    uninject('pc-spotify-update');
    uninject('pc-spotify-premium');

    getOwnerInstance(document.querySelector(`.${this.containerClasses.container.replace(/ /g, '.')}:not([id])`)).forceUpdate();
    powercord.off('webSocketMessage:dealer.spotify.com', this._handler);

    const el = document.querySelector('#powercord-spotify-modal');
    if (el) {
      el.remove();
    }
  }

  async openPremiumDialog () {
    if (!document.querySelector('.powercord-spotify-premium')) {
      const PremiumDialog = await getModuleByDisplayName('SpotifyPremiumUpgrade');
      openModal(() => React.createElement(PremiumDialog, { isPowercord: true }));
    }
  }

  openPlaylistModal (songURI) {
    openModal(() => React.createElement(PlaylistModal, { uri: songURI }));
  }

  getSpotifyLogo () {
    return fs.readFile(`${__dirname}/spotify.png`, { encoding: 'base64' });
  }

  async _injectModal () {
    const container = await waitFor(`.${this.containerClasses.container.replace(/ /g, '.')}`);
    const instance = getOwnerInstance(container);

    const modal = React.createElement(this.settings.connectStore(Modal), { main: this });
    await inject('pc-spotify-modal', instance.__proto__, 'render', (_, res) => [ modal, res ]);
    instance.forceUpdate();
  }

  async _injectListeningAlong () {
    const classes = await getModule([ 'listeningAlong' ]);
    const listeningAlong = await waitFor(`.${classes.listeningAlong.replace(/ /g, '.')}`);
    const instance = getOwnerInstance(listeningAlong);
    await inject('pc-spotify-listeningAlong', instance.__proto__, 'render', (_, res) => {
      this._listeningAlongComponent = res;
      if (this._forceUpdate) {
        this._forceUpdate();
      }
      return null;
    });
  }

  async _patchAutoPause (revert) {
    if (this.settings.get('noAutoPause', true)) {
      const mdl = await getModule([ 'SpotifyResourceTypes' ]);
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

  async _patchPremiumDialog () {
    const PremiumDialog = await getModuleByDisplayName('SpotifyPremiumUpgrade');

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
