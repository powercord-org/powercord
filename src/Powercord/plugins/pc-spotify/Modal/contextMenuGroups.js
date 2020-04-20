const { clipboard, shell } = require('electron');
const { messages, channels } = require('powercord/webpack');
const { formatTime } = require('powercord/util');
const SpotifyPlayer = require('../SpotifyPlayer');

function getDeviceIcon (device) {
  const deviceIcons = {
    Computer: 'desktop-duotone',
    Tablet: 'tablet-alt-duotone',
    Smartphone: 'mobile-alt-duotone',
    Speaker: 'speaker-duotone',
    TV: 'tv-alt-duotone',
    AVR: 'digital-tachograph-duotone',
    STB: 'hdd-duotone',
    AudioDongle: 'usb-drive-duotone',
    GameConsole: 'gamepad-alt-duotone',
    CastAudio: 'bluetooth-b-brands',
    CastVideo: 'chromecast-brands',
    Car: 'car-side-duotone',
    Unknown: 'question-circle-duotone'
  };

  return deviceIcons[device];
}

module.exports = (state, onButtonClick, hasCustomAuth, hasControlsHidden, hasIconsHidden) => [
  [ {
    type: 'submenu',
    name: 'Devices',
    width: '200px',
    getItems: () => SpotifyPlayer.getDevices()
      .then(({ devices }) =>
        devices.map(device => {
          const isActiveDevice = device.id === state.deviceID;

          return {
            type: 'button',
            name: device.name,
            icon: hasIconsHidden ? '' : getDeviceIcon(device.type),
            hint: hasIconsHidden ? device.type : '',
            highlight: isActiveDevice && '#1ed860',
            disabled: isActiveDevice,
            separate: isActiveDevice,
            onClick: () => onButtonClick('setActiveDevice', device.id)
          };
        }).sort(button => !button.highlight)
      )
  } ],

  [ {
    type: 'submenu',
    name: 'Playlists',
    width: '200px',
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
  }, ...(hasCustomAuth
    ? [ {
      type: 'submenu',
      name: 'Albums',
      width: '200px',
      getItems: () => SpotifyPlayer.getAlbums()
        .then(({ items }) =>
          items.map(({ album }) => ({
            type: 'button',
            name: album.name,
            hint: `${album.tracks.total} tracks`,
            onClick: () => onButtonClick('play', {
              context_uri: album.uri
            })
          }))
        )
    }, {
      type: 'submenu',
      name: 'Top Songs',
      width: '200px',
      getItems: () => SpotifyPlayer.getTopSongs()
        .then(({ items }) =>
          items.map(track => ({
            type: 'button',
            name: track.name,
            hint: formatTime(track.duration_ms),
            onClick: () => onButtonClick('play', {
              uris: [ track.uri ]
            })
          }))
        )
    }, {
      type: 'submenu',
      name: 'Songs',
      width: '200px',
      getItems: () => SpotifyPlayer.getSongs()
        .then(({ items }) =>
          items.map(({ track }) => ({
            type: 'button',
            name: track.name,
            hint: formatTime(track.duration_ms),
            onClick: () => onButtonClick('play', {
              uris: [ track.uri ]
            })
          }))
        )
    } ]
    : []) ],

  ...(hasCustomAuth && hasControlsHidden
    ? [ [ {
      type: 'submenu',
      name: 'Playback Settings',
      getItems: () => [ {
        type: 'submenu',
        name: 'Repeat Modes',
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
          onClick: () => onButtonClick('setRepeatState', button.stateName),
          ...button
        }))
      }, {
        type: 'checkbox',
        name: 'Shuffle',
        defaultState: state.shuffleState,
        onToggle: (s) => onButtonClick('setShuffleState', s)
      } ]
    } ] ]
    : []),

  [ {
    type: 'slider',
    name: 'Volume',
    color: '#1ed860',
    initialValue: state.volume,
    onValueChange: (val) =>
      SpotifyPlayer.setVolume(Math.round(val))
        .then(() => true)
  }, ...(hasCustomAuth && hasControlsHidden
    ? [ {
      type: 'button',
      name: 'Save to Liked Songs',
      icon: hasIconsHidden ? '' : 'heart-circle-duotone',
      onClick: () =>
        SpotifyPlayer.addSong(state.currentItem.id)
    }, {
      type: 'button',
      name: 'Save to Playlist',
      icon: hasIconsHidden ? '' : 'plus-circle-duotone',
      onClick: () =>
        powercord.pluginManager.get('pc-spotify').openPlaylistModal(state.currentItem.id)
    } ]
    : []) ],

  [ {
    type: 'button',
    name: 'Open in Spotify',
    icon: hasIconsHidden ? '' : 'external-link-alt-duotone',
    onClick: () =>
      shell.openExternal(state.currentItem.uri)
  }, {
    type: 'button',
    name: 'Send URL to Channel',
    icon: hasIconsHidden ? '' : 'share-square-duotone',
    onClick: () =>
      messages.sendMessage(
        channels.getChannelId(),
        { content: state.currentItem.url }
      )
  }, {
    type: 'button',
    name: 'Copy URL',
    icon: hasIconsHidden ? '' : 'copy-duotone',
    onClick: () =>
      clipboard.writeText(state.currentItem.url)
  } ]
];
