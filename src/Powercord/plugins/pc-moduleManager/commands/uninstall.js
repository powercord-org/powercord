const Modal = require('../components/ConfirmModal');
const { React } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

const { resp } = require('../util/resp');

module.exports = {
  command: 'uninstall',
  description: 'Uninstall a plugin/theme',
  usage: '{c} [ plugin/theme ID ]',
  executor ([ id ]) {
    const isPlugin = powercord.pluginManager.plugins.has(id);
    const isTheme = powercord.styleManager.themes.has(id);

    if (!isPlugin && !isTheme) { // No match
      return resp(false, `Could not find plugin or theme matching "${id}".`);
    } else if (isPlugin && isTheme) { // Duplicate name
      return resp(false, `"${id}" is in use by both a plugin and theme. You will have to uninstall it from settings.`);
    } else if (isPlugin && id.startsWith('pc-')) { // Internal plugin
      return resp(false, `"${id}" provides core functionality and cannot be uninstalled.`);
    }

    const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;


    openModal(() => React.createElement(Modal, {
      red: true,
      header: `Uninstall ${id}`,
      desc: `Are you sure you want to uninstall and delete ${id}? This cannot be undone.`,
      onConfirm: () => {
        manager.uninstall(id);

        powercord.api.notices.sendToast(`PDPluginUninstalled-${id}`, {
          header: `${isPlugin ? 'Plugin' : 'Theme'} Uninstalled`,
          content: `${id} uninstalled and deleted`,
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: 'Got It',
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      },
      onCancel: () => closeModal()
    }));
  },

  autocomplete (args) {
    const plugins = Array.from(powercord.pluginManager.plugins.values())
      .filter(plugin =>
        !plugin.entityID.startsWith('pc-') &&
        plugin.entityID.toLowerCase().includes(args[0]?.toLowerCase())
      );

    const themes = Array.from(powercord.styleManager.themes.values())
      .filter(theme =>
        theme.entityID.toLowerCase().includes(args[0]?.toLowerCase())
      );

    if (args.length > 1) {
      return false;
    }

    return {
      header: 'replugged entities list',
      commands: [
        ...plugins.map(plugin => ({
          command: plugin.entityID,
          description: `Plugin - ${plugin.manifest.description}`
        })),
        ...themes.map(theme => ({
          command: theme.entityID,
          description: `Theme - ${theme.manifest.description}`
        }))
      ]
    };
  }
};
