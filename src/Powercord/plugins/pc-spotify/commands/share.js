const { messages, channels } = require('powercord/webpack');

module.exports = {
  name: 'share',
  description: 'Send currently playing song to channel.',
  usage: '/share',

  async func (SpotifyPlayer) {
    if (SpotifyPlayer.player.item.external_urls) {
      messages.sendMessage(
        channels.getChannelId(),
        { content: SpotifyPlayer.player.item.external_urls.spotify }
      );
    }
  }
};
