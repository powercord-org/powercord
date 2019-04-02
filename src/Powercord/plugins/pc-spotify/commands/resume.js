module.exports = {
  command: 'resume',
  description: 'Resume Spotify playback',
  usage: '/resume',

  func (SpotifyPlayer) {
    return SpotifyPlayer.play();
  }
};
