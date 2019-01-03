module.exports = {
  name: 'previous',
  description: 'Go back one Spotify song',
  usage: '/previous',

  async func (SpotifyPlayer) {
    await SpotifyPlayer.prev();
  }
};
