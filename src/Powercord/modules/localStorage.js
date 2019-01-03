const { sleep } = require('powercord/util');

module.exports = async () => (
  window.localStorage = document.body
    .appendChild(document.createElement('iframe'))
    .contentWindow
    .localStorage
);
