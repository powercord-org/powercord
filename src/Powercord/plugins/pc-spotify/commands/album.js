const playerStore = require('../playerStore/store');

module.exports = {
  command: 'album',
  description: 'Send album of current playing song to selected channel',
  category: 'Spotify',
  executor () {
    const currentTrack = playerStore.getCurrentTrack();
    if (!currentTrack) {
      return {
        send: false,
        result: 'You are not currently listening to anything.'
      };
    }
    if (!currentTrack.urls.album) {
      return {
        send: false,
        result: 'The track you\'re listening to doesn\'t belong to an album.'
      };
    }
    return {
      send: true,
      result: currentTrack.urls.album
    };
  }
};
