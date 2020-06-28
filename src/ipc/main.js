const { ipcMain, BrowserWindow } = require('electron');

if (!ipcMain) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

function openDevTools (e, opts, externalWindow) {
  e.sender.openDevTools(opts);
  if (externalWindow) {
    console.log(BrowserWindow);
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
    e.sender.session.clearCache(() => resolve());
  });
}

ipcMain.on('POWERCORD_GET_PRELOAD', e => e.returnValue = e.sender._preload);
ipcMain.on('POWERCORD_OPEN_DEVTOOLS', openDevTools);
ipcMain.on('POWERCORD_CLOSE_DEVTOOLS', closeDevTools);
ipcMain.handle('POWERCORD_CACHE_CLEAR', clearCache);
