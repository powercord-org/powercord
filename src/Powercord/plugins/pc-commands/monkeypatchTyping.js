const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  const prefix = powercord.settingsManager.get('prefix', '.');

  typing.sendTyping = (
    sendTyping => (id) =>
      setImmediate(() => {
        if (this.instance) {
          return !this.instance.props.value.startsWith(prefix) && sendTyping(id);
        }
        sendTyping(id);
      })
  )(this.oldSendTyping = typing.sendTyping);
};
