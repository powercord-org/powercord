const { getModule } = require('powercord/webpack');
const SpotifyAPI = require('../SpotifyAPI');
const urlRegex = /\/track\/([A-z0-9]*)/;

module.exports = {
  command: 'play',
  description: 'Play a Spotify URL',
  usage: '{c} <URL>',
  category: 'Spotify',
  executor ([ url ]) {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (!isPremium) {
      return {
        send: false,
        result: 'Oops, it looks like you are not a Spotify Premium member. Unfortunately, this feature isn\'t available to you as per Spotify\'s requirements.'
      };
    }

    if (!url) {
      const spotifyModals = document.querySelectorAll('.embedSpotify-tvxDCr');
      const spotifyModal = spotifyModals[spotifyModals.length - 1];
      url = spotifyModal && spotifyModal.children[0].src;

      if (!url) {
        return {
          send: false,
          result: 'No URL specified.'
        };
      }
    }

    SpotifyAPI.play({
      uris: [
        `spotify:track:${urlRegex.exec(url)[1]}`
      ]
    });
  }
};
