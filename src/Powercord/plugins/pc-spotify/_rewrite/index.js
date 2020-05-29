const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { waitFor, getOwnerInstance, findInTree } = require('powercord/util');
const playlistActions = require('./playlistsStore/actions');
const SpotifyAPI = require('./SpotifyAPI');

const Modal = require('./components/Modal');

class Spotify extends Plugin {
  constructor () {
    super();

    this._handleSpotifyMessage = this._handleSpotifyMessage.bind(this);
  }

  get color () {
    return '#1ed860';
  }

  get SpotifyAPI () {
    return SpotifyAPI;
  }

  startPlugin () {
    powercord.on('webSocketMessage:dealer.spotify.com', this._handleSpotifyMessage);
    playlistActions.loadPlaylists();
    this._injectModal();
    console.log('henlo');
  }

  pluginWillUnload () {
    uninject('pc-spotify-modal');
    powercord.off('webSocketMessage:dealer.spotify.com', this._handleSpotifyMessage);
    playlistActions.purgeCache();
    console.log('byebye');
  }

  async _injectModal () {
    const { container } = await getModule([ 'container', 'usernameContainer' ]);
    const accountContainer = await waitFor(`.${container}`);
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

  _handleSpotifyMessage (msg) {
    const data = JSON.parse(msg.data);
    if (!data.type === 'message' || !data.payloads) {
      return;
    }

    const collectionRegex = /hm:\/\/collection\/collection\/[\w\d]+\/json/i;
    const playlistRegex = /hm:\/\/playlist\/v2\/playlist\/[\w\d]+/i;
    switch (true) {
      case data.uri === 'wss://event':
        for (const payload of data.payloads) {
          console.log('event', payload);
        }
        break;
      case collectionRegex.test(data.uri):
        for (const payload of data.payloads) {
          console.log('collecton', payload);
        }
        break;
      case playlistRegex.test(data.uri):
        for (const hermes of data.payloads) {
          const payload = this._decodePlaylistHermes(hermes);
          console.log('playlist', payload);
        }
        break;
    }
  }

  _decodePlaylistHermes (hermes) {
    const hex = Buffer.from(hermes, 'base64').toString('hex');
    const decoded = this._decodeHermes(hex);
    const trackDetails = this._decodeHermes(decoded[3].hex.substring(18));
    return {
      playlistId: decoded[0].utf8,
      trackId: trackDetails[0].utf8.replace(/[\n$]/g, ''),
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
