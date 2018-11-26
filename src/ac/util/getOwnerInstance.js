const getReactInstance = require('ac/util/getReactInstance');

module.exports = (node) => {
  for (let curr = getReactInstance(node); curr; curr = curr.return) {
    if (!curr) {
      continue;
    }

    const owner = curr.stateNode;
    if (owner && !(owner instanceof HTMLElement)) {
      return owner;
    }
  }

  return null;
};
