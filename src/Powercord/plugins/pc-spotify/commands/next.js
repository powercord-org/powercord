const { getModule } = require('powercord/webpack');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'next',
  aliases: [ 'skip' ],
  description: 'Skip Spotify song',
  usage: '{c}',
  category: 'Spotify',
  executor () {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (!isPremium) {
      return {
        send: false,
        result: 'Oops, it looks like you are not a Spotify Premium member. Unfortunately, this feature isn\'t available to you as per Spotify\'s requirements.'
      };
    }
    return SpotifyAPI.next();
  }
};
