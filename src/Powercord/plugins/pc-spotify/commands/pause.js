module.exports = {
  command: 'pause',
  description: 'Pause Spotify playback',
  usage: '/pause',

  func (SpotifyPlayer) {
    return SpotifyPlayer.pause();
  }
};
