module.exports = {
  command: 'volume',
  aliases: [ 'vol' ],
  description: 'Change Spotify volume',
  usage: '{c} <number between 0-100>',
  executor (SpotifyPlayer, [ args ]) {
    return SpotifyPlayer.setVolume(args);
  }
};
