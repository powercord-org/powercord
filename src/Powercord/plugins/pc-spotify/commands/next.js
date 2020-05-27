module.exports = {
  command: 'next',
  aliases: [ 'skip' ],
  description: 'Skip Spotify song',
  usage: '{c}',
  executor (SpotifyPlayer) {
    return SpotifyPlayer.next();
  }
};
