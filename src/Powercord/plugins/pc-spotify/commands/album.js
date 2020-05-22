const { open: openModal } = require('powercord/modal');
const { React } = require('powercord/webpack');
const ShareModal = require('../ShareModal');

module.exports = {
  command: 'album',
  description: 'Send currently playing song album to current channel',

  async func (SpotifyPlayer) {
    if (SpotifyPlayer.player.item.album.external_urls.spotify) {
      return {
        send: true,
        result: SpotifyPlayer.player.item.album.external_urls.spotify
      };
    }
  }
};
