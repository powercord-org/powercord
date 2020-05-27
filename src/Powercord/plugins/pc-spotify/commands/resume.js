module.exports = {
  command: 'resume',
  description: 'Resume Spotify playback',
  usage: '{c}',
  executor (SpotifyPlayer) {
    return SpotifyPlayer.play();
  }
};
