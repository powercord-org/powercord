const playerStore = require('../playerStore/store');

module.exports = {
  command: 'album',
  description: 'Send currently playing song album to current channel',
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
