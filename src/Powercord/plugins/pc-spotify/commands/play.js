const urlRegex = /\/track\/([A-z0-9]*)/;

module.exports = {
  command: 'play',
  description: 'Play a Spotify URL',
  usage: '{c} <URL>',
  async executor (SpotifyPlayer, [ url ]) {
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

    await SpotifyPlayer.play({
      uris: [
        `spotify:track:${urlRegex.exec(url)[1]}`
      ]
    });
  }
};
