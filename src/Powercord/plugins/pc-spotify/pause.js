module.exports = {
  name: 'pause',
  description: 'Pause Spotify playback',
  usage: '/pause',

  async func (SpotifyPlayer) {
    await SpotifyPlayer.pause();
  }
};
