module.exports = {
  name: 'previous',
  aliases: [ 'prev' ],
  description: 'Go back one Spotify song',
  usage: '/previous',

  func (SpotifyPlayer) {
    return SpotifyPlayer.prev();
  }
};
