const { sleep } = require('@ac/util');

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
    .filter(plugin => plugin.options.stage === stage)
    .map(async (plugin) => {
      while (!plugin.options.dependencies.every(pluginName => (
        aethcord.plugins.get(pluginName).ready
      ))) {
        await sleep(5);
      }

      plugin._start();
    });

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

module.exports = new Map(Object.entries(plugins));
