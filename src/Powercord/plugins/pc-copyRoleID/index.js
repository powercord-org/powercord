const Plugin = require('powercord/Plugin');
const { contextMenu, getModuleByDisplayName, React } = require('powercord/webpack');
const { ContextMenu } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');

// todo figure out how to do the same on UserPopOuts. Discussed with Aeth but seems to be a bit more complicated
module.exports = class CopyRoleID extends Plugin {
  start () {
    const GuildRole = getModuleByDisplayName('GuildRole');
    inject('pc-guildRole', GuildRole.prototype, 'render', (args, res) => { // eslint-disable-line func-names
      res.props.children.props.onContextMenu = (e) => {
        const { pageX, pageY } = e;
        contextMenu.openContextMenu(e, () =>
          React.createElement(ContextMenu, {
            pageX,
            pageY,
            itemGroups: [ [ {
              type: 'button',
              name: 'Copy ID',
              onClick: () => clipboard.writeText(res.props.id)
            } ] ]
          })
        );
      };
      return res;
    });
  }

  unload () {
    uninject('pc-guildRole');
  }
};
