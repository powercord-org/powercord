const Plugin = require('ac/Plugin');
const { waitFor, getOwnerInstance } = require('ac/util');
const commands = require('./commands');

module.exports = class Spotify extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'commands', 'webpack' ]
    });
  }

  async patchSpotify () {
    const {
      http,
      spotify,
      constants: { Endpoints }
    } = require('ac/webpack');

    const spotifyUserID = await http.get(Endpoints.CONNECTIONS)
      .then(res =>
        res.body.find(connection =>
          connection.type === 'spotify'
        ).id
      );

    spotify.getUserID = () => spotifyUserID;
    spotify.getAccessToken = (_getAccessToken =>
      (isInternalCall = false) => _getAccessToken(spotifyUserID)
        .then(res =>
          isInternalCall
            ? res
            : res.body.access_token
        )
    )(spotify.getAccessToken);

    return spotify;
  }

  async start () {
    const spotify = await this.patchSpotify();

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, spotify);

      aethcord
        .plugins
        .get('commands')
        .commands
        .set(commandName, command);
    }

    this.modalFuckery();
  }

  async modalFuckery () {
    const { React, ReactDOM } = require('ac/webpack');
    const Modal = require('./Modal.jsx');

    await waitFor('.container-2Thooq');

    const channels = document.querySelector('.channels-Ie2l6A');

    const userBarContainer = channels.querySelector('.container-2Thooq');

    const renderContainer = document.createElement('div');
    userBarContainer.parentNode.insertBefore(renderContainer, userBarContainer);
    ReactDOM.render(React.createElement(Modal), renderContainer);

    getOwnerInstance(document.querySelector('.channels-Ie2l6A'))
      .componentDidUpdate = () => {
        const containers = document.querySelectorAll('.container-2Thooq');
        containers[0].closest('.channels-Ie2l6A').insertBefore(containers[0], containers[1]);
      };
  }
};
