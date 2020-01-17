const { open: openModal } = require('powercord/modal');
const { React } = require('powercord/webpack');
const ShareModal = require('../ShareModal');

module.exports = {
  command: 'share',
  description: 'Send specified or currently playing song to current channel',
  usage: '{c} {song name/artist}',

  async func (SpotifyPlayer, query) {
    query = query.join(' ');

    if (query.length > 0) {
      const result = await SpotifyPlayer.search(query, 'track', 14);
      const closestTrack = result.tracks.items[0];

      if (result.tracks.items.length > 1) {
        return openModal(() => React.createElement(ShareModal, {
          tracks: result.tracks,
          query
        }));
      } else if (closestTrack) {
        return {
          send: true,
          result: closestTrack.external_urls.spotify
        };
      }

      return {
        send: false,
        result: `Couldn't find "\`${query}\`". Try searching again using a different spelling or keyword.`
      };
    }

    if (SpotifyPlayer.player.item.external_urls) {
      return {
        send: true,
        result: SpotifyPlayer.player.item.external_urls.spotify
      };
    }
  }
};
