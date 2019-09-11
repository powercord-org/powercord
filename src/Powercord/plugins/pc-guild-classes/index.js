const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

module.exports = class GuildClasses extends Plugin {
  startPlugin () {
    this._patchGuild();
  }

  pluginWillUnload () {
    uninject('pc-guild-classes');
  }

  async _patchGuild () {
    const blobModule = await getModule([ 'blobContainer' ]);
    const { blobContainer } = blobModule;
    const guildInner = await waitFor(`.${blobContainer}`);
    const guildElement = guildInner.parentElement;
    const Guild = getOwnerInstance(guildElement);
    inject('pc-guild-classes', Guild.constructor.prototype, 'render', (_, res) => {
      if (res._owner) {
        const { hovered } = res._owner.memoizedState;
        const { selected } = res._owner.pendingProps;
        if (hovered) {
          res.props.className += ' hovered';
        }
        if (selected) {
          res.props.className += ' selected';
        }
      }
      return res;
    });
  }
};
