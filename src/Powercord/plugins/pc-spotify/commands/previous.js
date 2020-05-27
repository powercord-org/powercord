module.exports = {
  command: 'previous',
  aliases: [ 'prev' ],
  description: 'Go back one Spotify song',
  usage: '{c}',
  executor (SpotifyPlayer) {
    return SpotifyPlayer.prev();
  }
};
