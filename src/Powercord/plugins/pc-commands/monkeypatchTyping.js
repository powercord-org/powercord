const { typing } = require('powercord/webpack');

module.exports = async function monkeypatchTyping () {
  typing.sendTyping = (sendTyping =>
    (id) =>
      setImmediate(() => {
        if (this.instance) {
          return !this.instance.props.value.startsWith(this.prefix) && sendTyping(id);
        }
        sendTyping(id);
      })
  )(this.oldSendTyping = typing.sendTyping);
};
