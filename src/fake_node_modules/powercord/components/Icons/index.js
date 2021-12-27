require('fs')
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file !== '.DS_Store')
  .forEach(filename => {
    const moduleName = filename.split('.')[0];
    exports[moduleName] = require(`${__dirname}/${filename}`);
  });
