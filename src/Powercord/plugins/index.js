const { sleep } = require('powercord/util');

require('fs')
  .readdirSync(__dirname)
  .filter(file => file !== 'index.js')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    const PluginClass = require(`${__dirname}/${filename}`);
    exports[moduleName] = new PluginClass();
  });
