const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'previous',
  aliases: [ 'prev' ],
  description: 'Go back one Spotify song',
  usage: '{c}',
  executor () {
    return SpotifyAPI.prev();
  }
};
