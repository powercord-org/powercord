module.exports = require('fs')
  .readdirSync(__dirname)
  .filter(file => !['index.js', '.DS_Store'].includes(file))
  .map(filename => require(`${__dirname}/${filename}`));
