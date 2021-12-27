module.exports = require('fs')
  .readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file !== '.DS_Store')
  .map(filename => require(`${__dirname}/${filename}`));
