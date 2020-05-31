const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'resume',
  description: 'Resume Spotify playback',
  usage: '{c}',
  executor () {
    return SpotifyAPI.play();
  }
};
