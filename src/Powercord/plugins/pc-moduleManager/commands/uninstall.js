const Modal = require('../components/ConfirmModal');
const { React } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

module.exports = {
  command: 'uninstall',
  description: 'Uninstall a selected plugin and delete the files.',
  usage: '{c} [ plugin ID ]',
  executor (args) {
    let result;

    if (powercord.pluginManager.plugins.has(args[0])) {
      if (args[0].startsWith('pc-')) {
        result = `->> ERROR: You cannot uninstall an internal plugin!
            (Tried to unload ${args[0]})`;
      } else {
        openModal(() => React.createElement(Modal, {
          red: true,
          header: `Uninstall ${args[0]}`,
          desc: `Are you sure you want to uninstall and delete ${args[0]}? This cannot be undone.`,
          onConfirm: () => {
            powercord.pluginManager.uninstall(args[0]);

            powercord.api.notices.sendToast(`PDPluginUninstalled-${args[0]}`, {
              header: 'Plugin Uninstalled',
              content: `${args[0]} uninstalled and deleted`,
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
      }
      return {
        send: false
      };
    }
    result = `->> ERROR: Tried to disable a non-installed plugin!
          (${args[0]})`;


    return {
      send: false,
      result: `\`\`\`diff\n${result}\`\`\``
    };
  },

  autocomplete (args) {
    const plugins = powercord.pluginManager.getPlugins()
      .sort((a, b) => a - b)
      .map(plugin => powercord.pluginManager.plugins.get(plugin));

    if (args.length > 1) {
      return false;
    }

    return {
      commands: plugins
        .filter(plugin => plugin.entityID !== 'pc-commands' &&
          plugin.entityID.toLowerCase().includes(args[0] && args[0].toLowerCase()))
        .map(plugin => ({
          command: plugin.entityID,
          description: plugin.manifest.description
        })),
      header: 'powercord plugin list'
    };
  }
};
