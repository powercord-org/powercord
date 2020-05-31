const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'pause',
  description: 'Pause Spotify playback',
  usage: '{c}',
  executor () {
    return SpotifyAPI.pause();
  }
};
