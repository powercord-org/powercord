const { getModule } = require('powercord/webpack');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'volume',
  aliases: [ 'vol' ],
  description: 'Change Spotify volume',
  usage: '{c} <number between 0-100>',
  category: 'Spotify',
  executor ([ args ]) {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (!isPremium) {
      return {
        send: false,
        result: 'Oops, it looks like you are not a Spotify Premium member. Unfortunately, this feature isn\'t available to you as per Spotify\'s requirements.'
      };
    }
    return SpotifyAPI.setVolume(args);
  }
};
