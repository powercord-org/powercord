const { sleep } = require('ac/util');

module.exports = async (querySelector) => {
  while (!document.querySelector(querySelector)) {
    await sleep(1);
  }

  return true;
};
