const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'next',
  aliases: [ 'skip' ],
  description: 'Skip Spotify song',
  usage: '{c}',
  executor () {
    return SpotifyAPI.next();
  }
};
