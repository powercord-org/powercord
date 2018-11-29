const { clipboard } = require('electron');
const SpotifyPlayer = require('../SpotifyPlayer');

module.exports = (state, onButtonClick) => [
  [ {
    type: 'submenu',
    name: 'Devices',
    getItems: () => SpotifyPlayer.getDevices()
      .then(({ devices }) =>
        devices.map(device => {
          const isActiveDevice = device.id === state.deviceID;

          return {
            type: 'button',
            name: device.name,
            hint: device.type,
            highlight: isActiveDevice && '#1ed860',
            disabled: isActiveDevice,
            seperate: isActiveDevice,
            onClick: () => onButtonClick('setActiveDevice', device.id)
          };
        })
        .sort(button => !button.highlight)
      )
  } ],

  [ {
    type: 'submenu',
    name: 'Playlists',
    getItems: () => SpotifyPlayer.getPlaylists()
      .then(({ items }) =>
        items.map(playlist => ({
          type: 'button',
          name: playlist.name,
          hint: `${playlist.tracks.total} tracks`,
          onClick: () => onButtonClick('play', {
            context_uri: playlist.uri
          })
        }))
      )
  } ],

  [ {
    type: 'submenu',
    name: 'Repeat mode',
    getItems: () => [ {
      name: 'On',
      stateName: 'context'
    }, {
      name: 'Current Track',
      stateName: 'track'
    }, {
      name: 'Off',
      stateName: 'off'
    } ].map(button => ({
      type: 'button',
      highlight: state.repeatState === button.stateName && '#1ed860',
      disabled: state.repeatState === button.stateName,
      onClick: () => onButtonClick('setRepeatMode', button.stateName),
      ...button
    }))
  } ],

  [ {
    type: 'slider',
    name: 'Volume',
    color: '#1ed860',
    defaultValue: state.volume,
    onValueChange: (val) =>
      SpotifyPlayer.setVolume(Math.round(val))
        .then(() => true)
  } ],

  [ {
    type: 'button',
    name: 'Send URL to channel',
    onClick: () =>
      messages.sendMessage(
        channels.getChannelId(),
        { content: state.currentItem.url }
      )
  }, {
    type: 'button',
    name: 'Copy URL',
    onClick: () =>
      clipboard.writeText(state.currentItem.url)
  } ]
];