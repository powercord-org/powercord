module.exports = {
  command: 'next',
  description: 'Skip Spotify song',
  usage: '/next',

  func (SpotifyPlayer) {
    return SpotifyPlayer.next();
  }
};
