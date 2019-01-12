const Plugin = require('powercord/Plugin');
const { open: openModal } = require('powercord/modal');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { React, ReactDOM, getModuleByDisplayName } = require('powercord/webpack');
const { resolve } = require('path');

const SpotifyPlayer = require('./SpotifyPlayer.js');
const commands = require('./commands');
const Modal = require('./Modal');

module.exports = class Spotify extends Plugin {
  async patchSpotifySocket () {
    powercord.on('webSocketMessage:dealer.spotify.com', (data) => {
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
    });

    this.emit('event', {
      type: 'PLAYER_STATE_CHANGED',
      event: {
        state: await SpotifyPlayer.getPlayer()
      }
    });
  }

  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.patchSpotifySocket();
    this.injectModal();
    this.patchPremiumDialog();

    this.on('event', ev => {
      if (ev.type === 'PLAYER_STATE_CHANGED') {
        this.SpotifyPlayer.player = ev.event.state;
      }
    });

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, SpotifyPlayer);

      powercord
        .pluginManager
        .get('pc-commands')
        .commands
        .set(commandName, command);
    }
  }

  async injectModal () {
    await waitFor('.container-2Thooq');

    const channels = document.querySelector('.channels-Ie2l6A');
    const userBarContainer = channels.querySelector('.container-2Thooq');

    const renderContainer = document.createElement('div');
    userBarContainer.parentNode.insertBefore(renderContainer, userBarContainer);
    ReactDOM.render(React.createElement(Modal, { main: this }), renderContainer);

    getOwnerInstance(document.querySelector('.channels-Ie2l6A'))
      .componentDidUpdate = () => {
        const [ spotifyModal, userBar ] = document.querySelectorAll('.container-2Thooq');

        spotifyModal
          .closest('.channels-Ie2l6A')
          .insertBefore(spotifyModal, userBar);
      };
  }

  openPremiumDialog () {
    const PremiumDialog = getModuleByDisplayName('SpotifyPremiumUpgrade');
    openModal(() => React.createElement(PremiumDialog, { isPowercord: true }));
  }

  patchPremiumDialog () {
    const PremiumDialog = getModuleByDisplayName('SpotifyPremiumUpgrade');

    PremiumDialog.prototype.render = ((_render) => function (...args) { // eslint-disable-line
      const res = _render.call(this, ...args);
      if (this.props.isPowercord) {
        res.props.children[1].props.children[1].props.children = 'Sorry pal, looks like you aren\'t a Spotify Premium member! Premium members are able to control Spotify through Discord with Powercord\'s Spotify modal';
      }
      return res;
    })(PremiumDialog.prototype.render);
  }

  get SpotifyPlayer () {
    return SpotifyPlayer;
  }
};
