const Plugin = require('powercord/Plugin');
const { contextMenu, getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { waitFor, getOwnerInstance } = require('powercord/util');
const { ContextMenu } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');

module.exports = class CopyRoleID extends Plugin {
  async start () {
    this.injectGuildRole();
    this.injectMemberRole();
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
    return (e) => {
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

  unload () {
    uninject('pc-guildRole');
    uninject('pc-memberRole');
  }
};
