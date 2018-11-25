const Plugin = require('@ac/plugin');
const commands = require('./commands');

module.exports = class Spotify extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'commands' ]
    });
  }

  async patchSpotify (spotify) {
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
  }

  async start () {
    const {
      spotify,
      http,
      constants: { Endpoints }
    } = aethcord.plugins.get('webpack');

    this.patchSpotify(spotify);

    for (const [ commandName, command ] of Object.entries(commands)) {
      command.func = command.func.bind(command, spotify);

      aethcord
        .plugins
        .get('commands')
        .commands
        .set(command, commands[command]);
    }
  }
};
