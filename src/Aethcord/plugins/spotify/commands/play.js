const urlRegex = /\/track\/([A-z0-9]*)/;

module.exports = {
  name: 'play',
  description: 'Play a Spotify URL',
  usage: '/play <URL>',

  getURLFromModal () {
    const spotifyModals = document.querySelectorAll('.embedSpotify-tvxDCr');
    const spotifyModal = spotifyModals[spotifyModals.length - 1];

    return spotifyModal && spotifyModal.children[0].src;
  },

  async func (spotify, [ url = this.getURLFromModal() ]) {
    if (!url) {
      return {
        send: false,
        result: 'No URL specified.'
      };
    }

    await spotify.play(
      spotify.getUserID(),
      await spotify.getAccessToken(),
      urlRegex.exec(url)[1]
    );
  }
}