const { messages, channels } = require('powercord/webpack');

module.exports = {
  command: 'share',
  description: 'Send currently playing song to channel',
  usage: '{c}',

  async func (SpotifyPlayer) {
    if (SpotifyPlayer.player.item.external_urls) {
      messages.sendMessage(
        channels.getChannelId(),
        { content: SpotifyPlayer.player.item.external_urls.spotify }
      );
    }
  }
};
