const Plugin = require('ac/Plugin');
const { sleep, createElement } = require('ac/util');
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

    while (!document.querySelector('.container-2Thooq')) {
      await sleep(2000);
    }

    const ree = document.createElement('link');
    ree.setAttribute('rel', 'stylesheet');
    ree.setAttribute('href', 'https://use.fontawesome.com/releases/v5.5.0/css/all.css');
    document.body.appendChild(ree);

    const channels = document.querySelector('.channels-Ie2l6A');

    const userBarContainer = channels.querySelector('.container-2Thooq');
    const containers = createElement('div', {
      id: 'channel-containers'
    });
    userBarContainer.parentNode.appendChild(containers);
    containers.appendChild(userBarContainer);

    const thing = createElement('div', {
      className: 'container-2Thooq'
    });

    thing.appendChild(
      createElement('div', {
        className: 'wrapper-2F3Zv8 small-5Os1Bb avatar-small',
        style: 'background-image: url(https://upload.wikimedia.org/wikipedia/en/thumb/5/57/Sunset_Lover_cover.jpg/220px-Sunset_Lover_cover.jpg)'
      })
    );

    thing.appendChild(createElement('div', {
      className: 'accountDetails-3k9g4n nameTag-m8r81H',
      innerHTML: '<span class="username">Sunset Lover</span><span class="discriminator">by Petit Biscuit</span>'
    }));

    const btns = createElement('div', {
      className: 'flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'
    });

    btns.appendChild(
      createElement('button', {
        style: 'color: #1ed860',
        className: 'iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
      })
    );
    btns.appendChild(
      createElement('button', {
        style: 'color: #1ed860',
        className: 'iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-pause'
      })
    );
    btns.appendChild(
      createElement('button', {
        style: 'color: #1ed860',
        className: 'iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
      })
    );

    thing.appendChild(btns);
    containers.prepend(
      thing
    );
  }
};
