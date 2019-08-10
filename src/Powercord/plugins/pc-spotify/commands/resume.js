module.exports = {
  command: 'resume',
  description: 'Resume Spotify playback',
  usage: '{c}',

  func (SpotifyPlayer) {
    return SpotifyPlayer.play();
  }
};
