const sleep = require('@ac/sleep');

const plugins = (() => {
  const plugins = {};

  require('fs')
    .readdirSync(__dirname)
    .filter(file => file !== 'index.js')
    .map(filename => {
      const moduleName = filename.split('.')[0];
      const PluginClass = require(`${__dirname}/${filename}`);
      plugins[moduleName] = new PluginClass();
    });

  return plugins;
})();

const startPlugins = (stage) => Promise.all(
  Object.values(plugins)
    .filter(plugin => plugin.options.stage === stage)
    .map(async (plugin) => {
      while (!plugin.options.dependencies.every(pluginName => (
        aethcord.plugins.get(pluginName).ready
      ))) {
        await sleep(5);
      }

      return plugin._start();
    })
);

startPlugins(0);

process.once('loaded', () => {
  startPlugins(1);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startPlugins(2);
  });
} else {
  startPlugins(2);
}

module.exports = new Map(Object.entries(plugins));