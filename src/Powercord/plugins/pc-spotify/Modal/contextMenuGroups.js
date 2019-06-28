const { clipboard, shell } = require('electron');
const { messages, channels } = require('powercord/webpack');
const { formatTime } = require('powercord/util');
const SpotifyPlayer = require('../SpotifyPlayer');

function getDeviceIcon (device) {
  const deviceIcons = {
    Computer: 'fa-desktop',
    Tablet: 'fa-tablet-alt',
    Smartphone: 'fa-mobile-alt',
    Speaker: 'fa-volume-up',
    TV: 'fa-tv',
    AVR: 'fa-digital-tachograph',
    STB: 'fa-hdd',
    AudioDongle: 'fa-usb-brand',
    GameConsole: 'fa-gamepad',
    CastAudio: 'fa-bluetooth-b-brand',
    CastVideo: 'fa-video',
    Car: 'fa-car',
    Unknown: 'fa-question-circle'
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
            image: hasIconsHidden ? '' : getDeviceIcon(device.type),
            hint: hasIconsHidden ? device.type : '',
            highlight: isActiveDevice && '#1ed860',
            disabled: isActiveDevice,
            seperate: isActiveDevice,
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
    } ]
    : []), ...(hasCustomAuth
    ? [ {
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
    } ]
    : []), ...(hasCustomAuth
    ? [ {
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
        image: hasIconsHidden ? '' : 'fa-sync',
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
    defaultValue: state.volume,
    onValueChange: (val) =>
      SpotifyPlayer.setVolume(Math.round(val))
        .then(() => true)
  }, ...(hasCustomAuth && hasControlsHidden
    ? [ {
      type: 'button',
      name: 'Add to Library',
      image: hasIconsHidden ? '' : 'fa-plus-circle',
      onClick: () =>
        SpotifyPlayer.addSong(state.currentItem.id)
    }, {
      type: 'button',
      name: 'Save to Playlist',
      image: hasIconsHidden ? '' : 'fa-save',
      onClick: () =>
        powercord.pluginManager.get('pc-spotify').openPlaylistModal(state.currentItem.id)
    } ]
    : []) ],

  [ {
    type: 'button',
    name: 'Open in Spotify',
    image: hasIconsHidden ? '' : 'fa-external-link-alt',
    onClick: () =>
      shell.openExternal(state.currentItem.uri)
  }, {
    type: 'button',
    name: 'Send URL to Channel',
    image: hasIconsHidden ? '' : 'fa-share-square',
    onClick: () =>
      messages.sendMessage(
        channels.getChannelId(),
        { content: state.currentItem.url }
      )
  }, {
    type: 'button',
    name: 'Copy URL',
    image: hasIconsHidden ? '' : 'fa-copy',
    onClick: () =>
      clipboard.writeText(state.currentItem.url)
  } ]
];
