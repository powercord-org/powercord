const { existsSync } = require('fs');
const { readFile } = require('fs').promises;
const { join, dirname } = require('path');
const { ipcMain, BrowserWindow } = require('electron');
const sass = require('sass');

if (!ipcMain) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

function openDevTools (e, opts, externalWindow) {
  e.sender.openDevTools(opts);
  if (externalWindow) {
    if (externalWindow) {
      let devToolsWindow = new BrowserWindow({ webContents: e.sender.devToolsWebContents });
      devToolsWindow.on('ready-to-show', () => devToolsWindow.show());
      devToolsWindow.on('close', () => {
        e.sender.closeDevTools();
        devToolsWindow = null;
      });
    }
  }
}

function closeDevTools (e) {
  e.sender.closeDevTools();
}

function clearCache (e) {
  return new Promise(resolve => {
    e.sender.session.clearCache(() => resolve(null));
  });
}

function compileSass (_, file) {
  return new Promise((resolve, reject) => {
    readFile(file, 'utf8').then(rawScss => {
      sass.render({
        data: rawScss,
        importer: (url, prev) => {
          url = url.replace('file:///', '');
          if (existsSync(url)) {
            return { file: url };
          }

          const prevFile = prev === 'stdin' ? file : prev.replace(/https?:\/\/(?:[a-z]+\.)?discord(?:app)?\.com/i, '');
          return {
            file: join(dirname(decodeURI(prevFile)), url).replace(/\\/g, '/')
          };
        }
      }, (err, compiled) => {
        if (err) {
          return reject(err);
        }
        resolve(compiled.css.toString());
      });
    });
  });
}

ipcMain.on('POWERCORD_GET_PRELOAD', e => e.returnValue = e.sender._powercordPreload);
ipcMain.handle('POWERCORD_OPEN_DEVTOOLS', openDevTools);
ipcMain.handle('POWERCORD_CLOSE_DEVTOOLS', closeDevTools);
ipcMain.handle('POWERCORD_CACHE_CLEAR', clearCache);
ipcMain.handle('POWERCORD_COMPILE_MF_SASS', compileSass);
