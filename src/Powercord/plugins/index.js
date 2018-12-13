const { sleep } = require('powercord/util');

const plugins = (() => {
  const _plugins = {};

  require('fs')
    .readdirSync(__dirname)
    .filter(file => file !== 'index.js')
    .forEach(filename => {
      const moduleName = filename.split('.')[0];
      const PluginClass = require(`${__dirname}/${filename}`);
      _plugins[moduleName] = new PluginClass();
    });

  return _plugins;
})();

const startPlugins = (stage) =>
  Object.values(plugins)
    .filter(plugin => {
      if (plugin.options.stage !== stage) {
        return false;
      }

      switch (plugin.options.appMode) {
        case 'overlay':
          return location.pathname === '/overlay';

        case 'app':
          return location.pathname !== '/overlay';

        case 'both':
          return true;

        default:
          return false;
      }
    })
    .map(async (plugin) => {
      while (!plugin.options.dependencies.every(pluginName => (
        powercord.plugins.get(pluginName).ready
      ))) {
        await sleep(5);
      }

      plugin._start();
    });

module.exports = new Map(Object.entries(plugins));

(async () => {
  while (!global.powercord) {
    await sleep(5);
  }

  startPlugins(0);

  process.once('loaded', () => {
    startPlugins(1);
  });

  const stage2 = () => startPlugins(2);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stage2);
  } else {
    stage2();
  }
})();
