const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  typing.startTyping = (
    _startTyping => (id) =>
      setImmediate(() => {
        if (this.instance && this.instance.props.textValue.startsWith(powercord.api.commands.prefix)) {
          return;
        }

        _startTyping(id);
      })
  )(this.oldStartTyping = typing.startTyping);
};
