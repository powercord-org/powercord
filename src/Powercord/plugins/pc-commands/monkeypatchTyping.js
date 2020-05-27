const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  typing.startTyping = (
    _startTyping => (id) =>
      setImmediate(() => {
        // @todo: Take into account new command prop
        if (this.instance && this.instance.props.textValue.startsWith(powercord.api.commands.prefix)) {
          return;
        }
        _startTyping(id);
      })
  )(this.oldStartTyping = typing.startTyping);
};
