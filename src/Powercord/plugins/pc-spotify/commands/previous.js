module.exports = {
  name: 'previous',
  description: 'Go back one Spotify song',
  usage: '/previous',

  func (SpotifyPlayer) {
    return SpotifyPlayer.prev();
  }
};
