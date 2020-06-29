const playerStore = require('../playerStore/store');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'like',
  description: 'Like a current playing song',
  async executor () {
    if (!powercord.account && powercord.account.spotify) {
      return {
        send: false,
        result: 'You need a Powercord account and connected Spotify account.'
      };
    }
    const currentTrack = playerStore.getCurrentTrack();
    if (!currentTrack) {
      return {
        send: false,
        result: 'You are not currently listening to anything.'
      };
    }
    const { body } = await SpotifyAPI.checkLibrary(currentTrack.id);
    if (body[0]) {
      SpotifyAPI.removeSong(currentTrack.id);
      return {
        send: false,
        result: `You removed **${currentTrack.name}** by **${currentTrack.artists}** from your Liked Songs`
      };
    }
    SpotifyAPI.addSong(currentTrack.id);
    return {
      send: false,
      result: `You added **${currentTrack.name}** by **${currentTrack.artists}** to your Liked Songs`
    };
  }
};
