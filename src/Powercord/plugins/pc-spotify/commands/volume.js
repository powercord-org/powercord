const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'volume',
  aliases: [ 'vol' ],
  description: 'Change Spotify volume',
  usage: '{c} <number between 0-100>',
  executor ([ args ]) {
    return SpotifyAPI.setVolume(args);
  }
};
