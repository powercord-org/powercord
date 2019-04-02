module.exports = {
  command: 'previous',
  aliases: [ 'prev' ],
  description: 'Go back one Spotify song',
  usage: '/previous',

  func (SpotifyPlayer) {
    return SpotifyPlayer.prev();
  }
};
