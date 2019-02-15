module.exports = {
  name: 'volume',
  description: 'Change Spotify volume',
  usage: '/volume <number between 1-100>',

  func (SpotifyPlayer, [ args ]) {
    return SpotifyPlayer.setVolume(args);
  }
};
