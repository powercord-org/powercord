module.exports = {
  name: 'resume',
  description: 'Resume Spotify playback',
  usage: '/resume',

  async func (SpotifyPlayer) {
    await SpotifyPlayer.play();
  }
};
