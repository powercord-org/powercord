const { findInReactTree } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const userStore = await getModule([ 'getCurrentUser', 'getUser' ]);
  const Message = await getModule(m => (m.__powercordOriginal_default || m.default)?.toString().includes('childrenRepliedMessage'));
  inject('pc-utilitycls-messages', Message, 'default', (_, res) => {
    const msg = findInReactTree(res, n => n.message);
    if (!msg) {
      if (findInReactTree(res, n => n.className && n.className.startsWith('blockedSystemMessage'))) {
        res.props.children.props['data-is-blocked'] = 'true';
      }
      return res;
    }
    const { message } = msg;
    res.props.children.props['data-author-id'] = message.author.id;
    res.props.children.props['data-message-type'] = message.type;
    res.props.children.props['data-is-author-bot'] = String(message.author.bot);
    if (userStore.getCurrentUser()) {
      res.props.children.props['data-is-author-self'] = String(message.author.id === userStore.getCurrentUser().id);
    }
    return res;
  });
  Message.default.displayName = 'Message';

  return async () => {
    uninject('pc-utilitycls-messages');
  };
};
