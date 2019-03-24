const { Plugin } = require('powercord/entities');
const { contextMenu, getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { ContextMenu } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');

module.exports = class CopyRoleID extends Plugin {
  async pluginDidLoad () {
    this.injectGuildRole();
    this.injectMemberRole();
  }

  pluginWillUnload () {
    uninject('pc-guildRole');
    uninject('pc-memberRole');
  }

  async injectGuildRole () {
    const GuildRole = await getModuleByDisplayName('GuildRole');
    inject('pc-guildRole', GuildRole.prototype, 'render', (args, res) => {
      res.props.children.props.onContextMenu = this.generateContextMenuCallback(res.props.id);
      return res;
    });
  }

  async injectMemberRole () {
    const _this = this;

    const roleClasses = await getModule([ 'role', 'roleCircle' ]);
    const roleQuery = `.${roleClasses.role.replace(/ /g, '.')}`;

    const instance = getOwnerInstance(await waitFor(roleQuery));
    inject('pc-memberRole', instance.__proto__, 'render', function (_, res) {
      res.props.onContextMenu = _this.generateContextMenuCallback(this.props.role.id);
      return res;
    });

    instance.forceUpdate();
  }

  generateContextMenuCallback (id) {
    return async (e) => {
      const settings = await getModule([ 'developerMode' ]);
      if (!settings.developerMode) {
        return;
      }

      const { pageX, pageY } = e;
      contextMenu.openContextMenu(e, () =>
        React.createElement(ContextMenu, {
          pageX,
          pageY,
          itemGroups: [ [ {
            type: 'button',
            name: 'Copy ID',
            onClick: () => clipboard.writeText(id)
          } ] ]
        })
      );
    };
  }
};
