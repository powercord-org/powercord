require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    const manifest = require(`${__dirname}/${filename}/manifest.json`);
    const PluginClass = require(`${__dirname}/${filename}`);
    const plugin = new PluginClass();
    Object.defineProperty(plugin, 'manifest', {
      get () {
        return manifest;
      },
      set () {
        throw new Error('Plugins cannot update manifest at runtime');
      }
    });
    exports[moduleName] = plugin;
  });
