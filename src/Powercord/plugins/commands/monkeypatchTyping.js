const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  typing.sendTyping = (sendTyping =>
    (id) =>
      setImmediate(() => (
        !this.instance.props.value.startsWith(this.prefix) && sendTyping(id)
      ))
  )(this.oldSendTyping = typing.sendTyping);
};
