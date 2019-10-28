module.exports = {
  command: 'next',
  aliases: [ 'skip' ],
  description: 'Skip Spotify song',
  usage: '{c}',

  func (SpotifyPlayer) {
    return SpotifyPlayer.next();
  }
};
