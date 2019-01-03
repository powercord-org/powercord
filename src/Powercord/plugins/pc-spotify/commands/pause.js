module.exports = {
  name: 'pause',
  description: 'Pause Spotify playback',
  usage: '/pause',

  func (SpotifyPlayer) {
    return SpotifyPlayer.pause();
  }
};
