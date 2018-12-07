const Plugin = require('powercord/Plugin');
const { waitFor, getOwnerInstance, sleep } = require('powercord/util');
const commands = require('./commands');

module.exports = class Spotify extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'commands', 'webpack' ]
    });
  }

  async getSocketBlocking (requirement = () => true) {
    const { spotifySocket } = require('powercord/webpack');

    let internalSocket;
    while (
      !(internalSocket = spotifySocket.getActiveSocketAndDevice()) &&
      requirement(internalSocket)
    ) {
      await sleep(1);
    }

    return internalSocket.socket;
  }

  async patchSpotifySocket () {
    const SpotifyPlayer = require('./SpotifyPlayer');
    let backoff, socket;

    ({ backoff } = await this.getSocketBlocking());

    const patchOnMessage = async () => {
      ({ socket } = await this.getSocketBlocking(({ socket }) => (
        !socket.onmessage.toString().startsWith('(data) =>')
      )));

      socket.onmessage = (_onmessage => (data) => {
        const parsedData = JSON.parse(data.data);
        if (parsedData.type === 'message' && parsedData.payloads) {
          for (const payload of parsedData.payloads) {
            for (const event of payload.events) {
              this.emit('event', event);
            }
          }
        }

        return _onmessage(data);
      })(socket.onmessage);
    }

    backoff.succeed = (_succeed => () => {
      patchOnMessage();
      return _succeed.call(backoff);
    })(backoff.succeed);

    this.emit('event', {
      type: 'PLAYER_STATE_CHANGED',
      event: {
        state: await SpotifyPlayer.getPlayer()
      }
    });
  }

  async start () {
    const { spotify } = require('powercord/webpack');

    this.patchSpotifySocket();

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, spotify);

      powercord
        .plugins
        .get('commands')
        .commands
        .set(commandName, command);
    }

    this.modalFuckery();
  }

  async modalFuckery () {
    const { React, ReactDOM } = require('powercord/webpack');
    const Modal = require('./Modal');

    await waitFor('.container-2Thooq');

    const channels = document.querySelector('.channels-Ie2l6A');

    const userBarContainer = channels.querySelector('.container-2Thooq');

    const renderContainer = document.createElement('div');
    userBarContainer.parentNode.insertBefore(renderContainer, userBarContainer);
    ReactDOM.render(React.createElement(Modal, { main: this }), renderContainer);

    getOwnerInstance(document.querySelector('.channels-Ie2l6A'))
      .componentDidUpdate = () => {
        const containers = document.querySelectorAll('.container-2Thooq');
        containers[0].closest('.channels-Ie2l6A').insertBefore(containers[0], containers[1]);
      };
  }
};
