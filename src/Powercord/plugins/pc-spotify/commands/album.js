module.exports = {
  command: 'album',
  description: 'Send currently playing song album to current channel',
  async executor (SpotifyPlayer) {
    if (SpotifyPlayer.player.item.album.external_urls.spotify) {
      return {
        send: true,
        result: SpotifyPlayer.player.item.album.external_urls.spotify
      };
    }
  }
};
