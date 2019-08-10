module.exports = {
  command: 'previous',
  aliases: [ 'prev' ],
  description: 'Go back one Spotify song',
  usage: '{c}',

  func (SpotifyPlayer) {
    return SpotifyPlayer.prev();
  }
};
