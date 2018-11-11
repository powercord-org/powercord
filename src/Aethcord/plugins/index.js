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

const startPlugins = (stage) => 
  Object.values(plugins)
    .filter(plugin => plugin.options.stage === stage)
    .map(plugin => plugin._start());

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