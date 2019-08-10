module.exports = {
  command: 'next',
  description: 'Skip Spotify song',
  usage: '{c}',

  func (SpotifyPlayer) {
    return SpotifyPlayer.next();
  }
};
