const { Flux, FluxDispatcher } = require('powercord/webpack');
const { FluxActions } = require('../constants');

// eslint-disable-next-line no-unused-vars
let playlist = {};

class SpotifyPlaylistsStore extends Flux.Store {

}

module.exports = new SpotifyPlaylistsStore(FluxDispatcher, {
  [FluxActions.PLAYLIST_PURGE]: () => playlist = {}
});
