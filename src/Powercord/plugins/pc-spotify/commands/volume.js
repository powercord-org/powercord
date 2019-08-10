module.exports = {
  command: 'volume',
  aliases: [ 'vol' ],
  description: 'Change Spotify volume',
  usage: '{c} <number between 0-100>',

  func (SpotifyPlayer, [ args ]) {
    return SpotifyPlayer.setVolume(args);
  }
};
