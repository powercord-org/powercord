module.exports = {
  name: 'resume',
  description: 'Resume Spotify playback',
  usage: '/resume',

  func (SpotifyPlayer) {
    return SpotifyPlayer.play();
  }
};
