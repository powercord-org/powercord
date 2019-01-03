const Plugin = require('powercord/Plugin');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { spotify, React, ReactDOM } = require('powercord/webpack');
const { resolve } = require('path');

const commands = require('./commands');
const SpotifyPlayer = require('./SpotifyPlayer');
const Modal = require('./Modal');

module.exports = class Spotify extends Plugin {
  async patchSpotifySocket () {
    powercord.on('webSocketMessage:dealer.spotify.com', (data) => {
      const parsedData = JSON.parse(data.data);
      if (parsedData.type === 'message' && parsedData.payloads) {
        for (const payload of parsedData.payloads) {
          for (const ev of payload.events) {
            this.emit('event', ev);
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

    this.on('event', ev => {
      if (ev.type === 'PLAYER_STATE_CHANGED') {
        this.SpotifyPlayer.player = ev.event.state;
      }
    });

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, spotify);

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

  get SpotifyPlayer () {
    return SpotifyPlayer;
  }
};
