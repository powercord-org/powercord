const { open: openModal } = require('powercord/modal');
const { React } = require('powercord/webpack');
const SpotifyAPI = require('../SpotifyAPI');
const playerStore = require('../playerStore/store');
const ShareModal = require('../components/ShareModal');

module.exports = {
  command: 'share',
  description: 'Send specified or current playing song to selected channel',
  usage: '{c} {song name/artist}',
  category: 'Spotify',
  async executor (query) {
    query = query.join(' ');

    if (query.length > 0) {
      const result = await SpotifyAPI.search(query, 'track', 14);
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

    const currentTrack = playerStore.getCurrentTrack();
    if (!currentTrack) {
      return {
        send: false,
        result: 'You are not currently listening to anything.'
      };
    }

    return {
      send: true,
      result: currentTrack.urls.track
    };
  }
};
