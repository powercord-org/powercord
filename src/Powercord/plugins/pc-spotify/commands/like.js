const playerStore = require('../playerStore/store');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'like',
  description: 'Like a current playing song',
  async executor () {
    const currentTrack = playerStore.getCurrentTrack();
    if (!currentTrack) {
      return {
        send: false,
        result: 'You are not currently listening to anything.'
      };
    }
    const hasCoolFeatures = powercord.account && powercord.account.spotify;
    if (!hasCoolFeatures) {
      return {
        send: false,
        result: 'You need a powercord account and connected Spotify account.'
      };
    }

    const { body } = await SpotifyAPI.checkLibrary(currentTrack.id);
    if (body[0]) {
      SpotifyAPI.removeSong(currentTrack.id);
      return {
        send: false,
        result: `You removed **${currentTrack.name} by ${currentTrack.artists}** from your Liked Songs`
      };
    }
    SpotifyAPI.addSong(currentTrack.id);
    return {
      send: false,
      result: `You added **${currentTrack.name} by ${currentTrack.artists}** to your Liked Songs`
    };
  }
};
