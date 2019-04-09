// Taken from https://github.com/parro-it/keyboardevents-areequal, licensed under MIT license

function _lower (key) {
  if (typeof key !== 'string') {
    return key;
  }
  return key.toLowerCase();
}

module.exports = function areEqual (ev1, ev2) {
  if (ev1 === ev2) {
    return true;
  }

  for (const prop of [ 'altKey', 'ctrlKey', 'shiftKey', 'metaKey' ]) {
    const [ value1, value2 ] = [ ev1[prop], ev2[prop] ];

    if (Boolean(value1) !== Boolean(value2)) {
      return false;
    }
  }

  return (_lower(ev1.key) === _lower(ev2.key) && ev1.key !== void 0) ||
    (ev1.code === ev2.code && ev1.code !== void 0);
};
