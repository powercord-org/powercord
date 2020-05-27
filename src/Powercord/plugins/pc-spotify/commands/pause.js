module.exports = {
  command: 'pause',
  description: 'Pause Spotify playback',
  usage: '{c}',
  executor (SpotifyPlayer) {
    return SpotifyPlayer.pause();
  }
};
