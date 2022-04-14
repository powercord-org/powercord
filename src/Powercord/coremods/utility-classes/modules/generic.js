const { ipcRenderer } = require('electron');

module.exports = async () => {
  document.body.classList.add('powercord');
  if (window.__OVERLAY__) {
    document.body.classList.add('overlay');
  }

  if (powercord.settings.get('transparentWindow')) {
    document.body.classList.add('transparent');
  }
  if (powercord.settings.get('experimentalWebPlatform')) {
    document.body.classList.add('experimental-web-features');
  }
  const date = new Date();
  if (date.getMonth() === 3 && date.getDate() === 1) {
    document.body.classList.add('april-fools');
  }

  ipcRenderer.invoke('POWERCORD_WINDOW_IS_MAXIMIZED').then(isMaximized => {
    if (isMaximized) {
      document.body.classList.add('maximized');
    } else {
      document.body.classList.remove('maximized');
    }
  });

  ipcRenderer.on('POWERCORD_WINDOW_MAXIMIZE', () => document.body.classList.add('maximized'));
  ipcRenderer.on('POWERCORD_WINDOW_UNMAXIMIZE', () => document.body.classList.remove('maximized'));
};
