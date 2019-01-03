module.exports = {
  name: 'next',
  description: 'Skip Spotify song',
  usage: '/next',

  async func (SpotifyPlayer) {
    await SpotifyPlayer.next();
  }
};
