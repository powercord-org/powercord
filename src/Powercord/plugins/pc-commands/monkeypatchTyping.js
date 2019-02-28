const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  typing.sendTyping = (
    _sendTyping => (id) =>
      setImmediate(() => {
        if (this.instance && this.instance.props.value.startsWith(this.prefix)) {
          return;
        }

        _sendTyping(id);
      })
  )(this.oldSendTyping = typing.sendTyping);
};
