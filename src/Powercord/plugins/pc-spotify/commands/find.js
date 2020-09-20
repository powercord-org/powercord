const { getModule } = require('powercord/webpack');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'find',
  description: 'Searches for a song and plays it!',
  usage: '{c} {song}',
  category: 'Spotify',
  executor (args) {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (!isPremium) {
      return {
        send: false,
        result: 'Oops, it looks like you are not a Spotify Premium member. Unfortunately, this feature isn\'t available to you as per Spotify\'s requirements.'
      };
    }
    if (!args[0]) {
      return {
        send: false,
        result: 'You need to specify a song to search for and play!'
      };
    }

    return SpotifyAPI.search(args.join(' '), 'track', 1).then((body) => {
      const tracksArray = body.tracks.items;
      if (tracksArray.length > 0) {
        const trackURL = tracksArray[0].uri;
        SpotifyAPI.play({
          uris: [ trackURL ]
        });
        return;
      }
      return {
        send: false,
        result: 'Couldn\'t find a song!'
      };
    });
  }
};
