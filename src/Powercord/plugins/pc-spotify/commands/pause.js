module.exports = {
  command: 'pause',
  description: 'Pause Spotify playback',
  usage: '{c}',

  func (SpotifyPlayer) {
    return SpotifyPlayer.pause();
  }
};
