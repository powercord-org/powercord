const playerStore = require('../playerStore/store');
const SpotifyAPI = require('../SpotifyAPI');

module.exports = {
  command: 'like',
  description: 'Like the current playing song',
  category: 'Spotify',
  async executor () {
    if (!powercord.account || !powercord.account.accounts.spotify) {
      return {
        send: false,
        result: 'You need a Powercord account and connected Spotify account to use this feature!'
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
    SpotifyAPI[body[0] ? 'removeSong' : 'addSong'](currentTrack.id);
    return {
      send: false,
      result: `You ${body[0] ? 'removed' : 'added'} **${currentTrack.name}** by **${currentTrack.artists}** ${body[0] ? 'from' : 'to'} your Liked Songs.`
    };
  }
};
