const { get } = require('powercord/http');
const { messages, channels } = require('powercord/webpack');

module.exports = {
  name: 'lyrics',
  description: 'Send lyrics to a specific song or the currently playing song in chat!',
  usage: '/lyrics <song || ???>',

  async func (SpotifyPlayer, [ args ]) {
    try {
      let data = await get(`https://ksoft.derpyenterprises.org/lyrics?input=${args || SpotifyPlayer.player.item.name + SpotifyPlayer.player.item.artists[0].name}`).then(res => res.body);
      if (!data.data[0].lyrics) {
        return {
          send: false,
          result: 'Yikes, I couldn\'t find that song!'
        }
      }
      data = `${data.data[0].artist} - ${data.data[0].name}\n\n${data.data[0].lyrics}\n\nLyrics provided by KSoft.Si`;
      let value = data.replace(/(?:\\[rn])+/g, '');
      if (value.length > 2000) {
        return {
          send: false,
          result: '```' + value + '```'
        };
      }
      messages.sendMessage(
          channels.getChannelId(),
          { content: '```' + value + '```' }
      );
   } catch (e) {
      return; // UNESCAPED_CHARACTERS err
   }
  }
};
