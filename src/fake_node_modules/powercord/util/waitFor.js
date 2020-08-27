const sleep = require('./sleep');

module.exports = async (querySelector) => {
  let elem;

  while (!(elem = document.querySelector(querySelector))) {
    await sleep(1);
  }

  return elem;
};
