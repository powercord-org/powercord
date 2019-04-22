module.exports = {
  command: 'volume',
  aliases: [ 'vol' ],
  description: 'Change Spotify volume',
  usage: '/volume <number between 0-100>',

  func (SpotifyPlayer, [ args ]) {
    return SpotifyPlayer.setVolume(args);
  }
};
