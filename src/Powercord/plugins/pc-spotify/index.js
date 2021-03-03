const { Plugin } = require('powercord/entities');
const { React, getModule, spotify, spotifySocket } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { waitFor, getOwnerInstance, findInTree, sleep } = require('powercord/util');
const playerStoreActions = require('./playerStore/actions');
const playerStore = require('./playerStore/store');
const songsStoreActions = require('./songsStore/actions');
const songsStore = require('./songsStore/store');
const i18n = require('./i18n');
const commands = require('./commands');

const SpotifyAPI = require('./SpotifyAPI');

const Settings = require('./components/Settings');
const Modal = require('./components/Modal');

class Spotify extends Plugin {
  get color () {
    return '#1ed860';
  }

  get playerStore () {
    return playerStore;
  }

  get songsStore () {
    return songsStore;
  }

  get SpotifyAPI () {
    return SpotifyAPI;
  }

  startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadStylesheet('style.scss');
    this._injectSocket();
    this._injectModal();
    this._patchAutoPause();
    spotify.fetchIsSpotifyProtocolRegistered();

    SpotifyAPI.getPlayer()
      .then((player) => this._handlePlayerState(player))
      .catch((e) => this.error('Failed to get player', e));

    playerStoreActions.fetchDevices()
      .catch((e) => this.error('Failed to fetch devices', e));

    powercord.api.settings.registerSettings('pc-spotify', {
      category: this.entityID,
      label: 'Spotify',
      render: (props) =>
        React.createElement(Settings, {
          patch: this._patchAutoPause.bind(this),
          ...props
        })
    });

    Object.values(commands).forEach(cmd => powercord.api.commands.registerCommand(cmd));
  }

  pluginWillUnload () {
    uninject('pc-spotify-socket');
    uninject('pc-spotify-modal');
    // this._applySocketChanges();
    this._patchAutoPause(true);
    Object.values(commands).forEach(cmd => powercord.api.commands.unregisterCommand(cmd.command));
    powercord.api.settings.unregisterSettings('pc-spotify');
    spotifySocket.getActiveSocketAndDevice()?.socket.socket.close();
    songsStoreActions.purgeSongs();

    const { container } = getModule([ 'container', 'usernameContainer' ], false);
    const accountContainer = document.querySelector(`section > .${container}`);
    const instance = getOwnerInstance(accountContainer);
    instance.forceUpdate();
  }

  async _injectSocket () {
    const { SpotifySocket } = await getModule([ 'SpotifySocket' ]);
    inject('pc-spotify-socket', SpotifySocket.prototype, 'handleMessage', ([ e ]) => this._handleSpotifyMessage(e));
    spotifySocket.getActiveSocketAndDevice()?.socket.socket.close();
  }

  async _injectModal () {
    await sleep(1e3); // It ain't stupid if it works
    const { container } = await getModule([ 'container', 'usernameContainer' ]);
    const accountContainer = await waitFor(`section > .${container}`);
    const instance = getOwnerInstance(accountContainer);
    await inject('pc-spotify-modal', instance.__proto__, 'render', (_, res) => {
      const realRes = findInTree(res, t => t.props && t.props.className === container);
      return [
        React.createElement(Modal, {
          entityID: this.entityID,
          base: realRes
        }),
        res
      ];
    });
    instance.forceUpdate();
  }

  _patchAutoPause (revert) {
    if (this.settings.get('noAutoPause', true)) {
      const spotifyMdl = getModule([ 'initialize', 'wasAutoPaused' ], false);
      if (revert) {
        spotifyMdl.wasAutoPaused = spotifyMdl._wasAutoPaused;
        spotify.pause = spotify._pause;
      } else {
        spotifyMdl._wasAutoPaused = spotifyMdl.wasAutoPaused;
        spotifyMdl.wasAutoPaused = () => false;
        spotify._pause = spotify.pause;
        spotify.pause = () => void 0;
      }
    }
  }

  _handleSpotifyMessage (msg) {
    const data = JSON.parse(msg.data);
    if (!data.type === 'message' || !data.payloads) {
      return;
    }

    const collectionRegex = /hm:\/\/collection\/collection\/[\w\d]+\/json/i;
    const playlistRegex = /hm:\/\/playlist\/v2\/playlist\/[\w\d]+/i;
    switch (true) {
      case data.uri === 'wss://event':
        for (const payload of data.payloads || []) {
          for (const event of payload.events || []) {
            this._handleSpotifyEvent(event);
          }
        }
        break;
      case collectionRegex.test(data.uri): {
        const currentTrack = playerStore.getCurrentTrack();
        if (!currentTrack) {
          // Useless to further process the event
          return;
        }

        for (const rawPayload of data.payloads || []) {
          const payload = JSON.parse(rawPayload);
          for (const track of payload.items) {
            if (track.identifier === currentTrack.id) {
              playerStoreActions.updateCurrentLibraryState(
                track.removed ? playerStore.LibraryState.NOT_IN_LIBRARY : playerStore.LibraryState.IN_LIBRARY
              );
            }
          }
        }
        break;
      }
      case playlistRegex.test(data.uri):
        for (const hermes of data.payloads || []) {
          const payload = this._decodePlaylistHermes(hermes);
          if (payload.added) {
            songsStoreActions.addTrack(payload.playlistId, payload.trackId);
          } else {
            songsStoreActions.deleteTrack(payload.playlistId, payload.trackId);
          }
        }
        break;
    }
  }

  _handleSpotifyEvent (evt) {
    switch (evt.type) {
      case 'PLAYER_STATE_CHANGED':
        this._handlePlayerState(evt.event.state);
        break;
      case 'DEVICE_STATE_CHANGED':
        playerStoreActions.fetchDevices();
        break;
    }
  }

  _handlePlayerState (state) {
    if (!state.timestamp) {
      return;
    }

    // Handle track
    const currentTrack = playerStore.getCurrentTrack();
    if (!currentTrack || currentTrack.id !== state.item.id) {
      if (this._libraryTimeout) {
        clearTimeout(this._libraryTimeout);
      }
      if (!state.item.is_local && powercord.account && powercord.account.accounts.spotify) {
        this._libraryTimeout = setTimeout(() => {
          SpotifyAPI.checkLibrary(state.item.id).then(r => playerStoreActions.updateCurrentLibraryState(
            r.body[0]
              ? playerStore.LibraryState.IN_LIBRARY
              : playerStore.LibraryState.NOT_IN_LIBRARY
          ));
        }, 1500);
      } else if (state.item.is_local) {
        playerStoreActions.updateCurrentLibraryState(playerStore.LibraryState.LOCAL_SONG);
      }
      playerStoreActions.updateCurrentTrack({
        id: state.item.id,
        uri: state.item.uri,
        name: state.item.name,
        isLocal: state.item.is_local,
        duration: state.item.duration_ms,
        explicit: state.item.explicit,
        cover: state.item.album && state.item.album.images[0] ? state.item.album.images[0].url : null,
        artists: state.item.artists.map(a => a.name).join(', '),
        album: state.item.album ? state.item.album.name : null,
        urls: {
          track: state.item.external_urls.spotify,
          album: state.item.album ? state.item.album.external_urls.spotify : null
        }
      });
    }

    // Handle state
    playerStoreActions.updatePlayerState({
      repeat: state.repeat_state === 'track'
        ? playerStore.RepeatState.REPEAT_TRACK
        : state.repeat_state === 'context'
          ? playerStore.RepeatState.REPEAT_CONTEXT
          : playerStore.RepeatState.NO_REPEAT,
      shuffle: state.shuffle_state,
      canRepeat: !state.actions.disallows.toggling_repeat_context,
      canRepeatOne: !state.actions.disallows.toggling_repeat_track,
      canShuffle: !state.actions.disallows.toggling_shuffle,
      spotifyRecordedProgress: state.progress_ms,
      playing: state.is_playing,
      volume: state.device.volume_percent
    });
  }

  _decodePlaylistHermes (hermes) {
    const hex = Buffer.from(hermes, 'base64').toString('hex');
    const decoded = this._decodeHermes(hex);
    const trackDetails = this._decodeHermes(decoded[3].hex.substring(18));
    return {
      playlistId: decoded[0].utf8.split(':').pop(),
      trackId: trackDetails[0].utf8.replace(/[\n$]/g, '').split(':').pop(),
      added: trackDetails.length === 2
    };
  }

  _decodeHermes (hex) {
    const res = [];
    for (let i = 0; i < hex.length;) {
      const length = parseInt(hex.substring(i + 2, i + 4), 16);
      const rawStr = hex.substring(i + 4, i + 4 + (length * 2));
      i += (length * 2) + 4;
      res.push({
        hex: rawStr,
        get utf8 () {
          return Buffer.from(rawStr, 'hex').toString('utf8');
        }
      });
    }
    return res;
  }
}

module.exports = Spotify;
