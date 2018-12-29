const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  const prefix = powercord.settingsManager.get('prefix', '.');

  typing.sendTyping = (
    _sendTyping => (id) =>
      setImmediate(() => {
        if (
          this.instance &&
          this.instance.props.value.startsWith(prefix)
        ) {
          return;
        }

        _sendTyping(id);
      })
  )(this.oldSendTyping = typing.sendTyping);
};
