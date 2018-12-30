const fs = require('fs');

if (!fs.promises) {
  const fsFunctions = [
    'access', 'appendFile', 'chmod', 'chown', 'copyFile', 'lchmod', 'lchown', 'link',
    'lstat', 'mkdir', 'mkdtemp', 'open', 'readdir', 'readFile', 'readlink', 'realpath',
    'rename', 'rmdir', 'stat', 'symlink', 'truncate', 'unlink', 'utimes', 'writeFile'
  ];

  fs.promises = {};

  function fsWrapper (funcName) {
    return (...args) => new Promise((res, rej) => {
      args.push((err, data) => {
        if (err) {
          return rej(err);
        }
        res(data);
      });
      fs[funcName](...args);
    });
  }

  fsFunctions.forEach(func => {
    fs.promises[func] = fsWrapper(func);
  });
}
