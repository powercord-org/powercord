const urlRegex = /\/track\/([A-z0-9]*)/;

module.exports = {
  name: 'play',
  description: 'Play a Spotify URL',
  usage: '/play <URL>',

  async func (spotify, [ url ]) {
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