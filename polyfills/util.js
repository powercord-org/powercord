const util = require('util');

if (!util.promisify) {
  const kCustomPromisifiedSymbol = Symbol('util.promisify.custom');
  const kCustomPromisifyArgsSymbol = Symbol('customPromisifyArgs');

  function promisify(original) {
    if (typeof original !== 'function')
    throw new TypeError(`expected type function, got ${typeof original}`);

    if (original[kCustomPromisifiedSymbol]) {
      const fn = original[kCustomPromisifiedSymbol];
      if (typeof fn !== 'function') {
        throw new TypeError(`expected type function for util.promisify.custom, got ${typeof fn}`);
      }
      return Object.defineProperty(fn, kCustomPromisifiedSymbol, {
        value: fn, enumerable: false, writable: false, configurable: true
      });
    }

    // Names to create an object from in case the callback receives multiple
    // arguments, e.g. ['stdout', 'stderr'] for child_process.exec.
    const argumentNames = original[kCustomPromisifyArgsSymbol];

    function fn(...args) {
      return new Promise((resolve, reject) => {
        original.call(this, ...args, (err, ...values) => {
          if (err) {
            return reject(err);
          }
          if (argumentNames !== undefined && values.length > 1) {
            const obj = {};
            for (var i = 0; i < argumentNames.length; i++)
              obj[argumentNames[i]] = values[i];
            resolve(obj);
          } else {
            resolve(values[0]);
          }
        });
      });
    }

    Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return Object.defineProperties(
      fn,
      Object.getOwnPropertyDescriptors(original)
    );
  }

  promisify.custom = kCustomPromisifiedSymbol;
  util.promisify = promisify;
}