// Taken from https://github.com/parro-it/electron-localshortcut/blob/master/index.js, licensed under MIT license

const { app, BrowserWindow } = require('electron');
const isAccelerator = require('./isAccelerator');
const isEqual = require('./isEqual');
const acceleratorToEvent = require('./acceleratorToEvent');

const ANY_WINDOW = {};
const windowsWithShortcuts = new WeakMap();

function _checkAccelerator (accelerator) {
  if (!isAccelerator(accelerator)) {
    const w = {};
    Error.captureStackTrace(w);
    const stack = w.stack ? w.stack.split('\n').slice(4).join('\n') : w.message;
    const msg = `
WARNING: ${accelerator} is not a valid accelerator.
${stack}
`;
    console.error(msg);
  }
}

/**
 * Disable all of the shortcuts registered on the BrowserWindow instance.
 * Registered shortcuts no more works on the `window` instance, but the module
 * keep a reference on them. You can reactivate them later by calling `enableAll`
 * method on the same window instance.
 * @param  {BrowserWindow} win BrowserWindow instance
 */
function disableAll (win) {
  const wc = win.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);

  for (const shortcut of shortcutsOfWindow) {
    shortcut.enabled = false;
  }
}

/**
 * Enable all of the shortcuts registered on the BrowserWindow instance that
 * you had previously disabled calling `disableAll` method.
 * @param  {BrowserWindow} win BrowserWindow instance
 */
function enableAll (win) {
  const wc = win.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);

  for (const shortcut of shortcutsOfWindow) {
    shortcut.enabled = true;
  }
}

/**
 * Unregisters all of the shortcuts registered on any focused BrowserWindow
 * instance. This method does not unregister any shortcut you registered on
 * a particular window instance.
 * @param  {BrowserWindow} win BrowserWindow instance
 */
function unregisterAll (win) {
  const wc = win.webContents;
  const shortcutsOfWindow = windowsWithShortcuts.get(wc);

  // Remove listener from window
  shortcutsOfWindow.removeListener();

  windowsWithShortcuts.delete(wc);
}

function _normalizeEvent (input) {
  const normalizedEvent = {
    code: input.code,
    key: input.key
  };

  [ 'alt', 'shift', 'meta' ].forEach(prop => {
    if (typeof input[prop] !== 'undefined') {
      normalizedEvent[`${prop}Key`] = input[prop];
    }
  });

  if (typeof input.control !== 'undefined') {
    normalizedEvent.ctrlKey = input.control;
  }

  return normalizedEvent;
}

function _findShortcut (event, shortcutsOfWindow) {
  let i = 0;
  for (const shortcut of shortcutsOfWindow) {
    if (isEqual(shortcut.eventStamp, event)) {
      return i;
    }
    i++;
  }
  return -1;
}

const _onBeforeInput = shortcutsOfWindow => (e, input) => {
  if (input.type === 'keyUp') {
    return;
  }

  const event = _normalizeEvent(input);

  for (const { eventStamp, callback } of shortcutsOfWindow) {
    if (isEqual(eventStamp, event)) {
      callback();
      return;
    }
  }
};

/**
 * Registers the shortcut `accelerator`on the BrowserWindow instance.
 * @param  {BrowserWindow} win - BrowserWindow instance to register.
 * This argument could be omitted, in this case the function register
 * the shortcut on all app windows.
 * @param  {String|Array<String>} accelerator - the shortcut to register
 * @param  {Function} callback    This function is called when the shortcut is pressed
 * and the window is focused and not minimized.
 */
function register (win, accelerator, callback) {
  let wc;
  if (typeof callback === 'undefined') {
    wc = ANY_WINDOW;
    callback = accelerator;
    accelerator = win;
  } else {
    wc = win.webContents;
  }
  if (Array.isArray(accelerator) === true) {
    accelerator.forEach(accelerator => {
      if (typeof accelerator === 'string') {
        register(win, accelerator, callback);
      }
    });
    return;
  }

  _checkAccelerator(accelerator);

  let shortcutsOfWindow;
  if (windowsWithShortcuts.has(wc)) {
    shortcutsOfWindow = windowsWithShortcuts.get(wc);
  } else {
    shortcutsOfWindow = [];
    windowsWithShortcuts.set(wc, shortcutsOfWindow);

    if (wc === ANY_WINDOW) {
      const keyHandler = _onBeforeInput(shortcutsOfWindow);
      const enableAppShortcuts = (e, win) => {
        const wc = win.webContents;
        wc.on('before-input-event', keyHandler);
        wc.once('closed', () =>
          wc.removeListener('before-input-event', keyHandler)
        );
      };

      // Enable shortcut on current windows
      const windows = BrowserWindow.getAllWindows();

      windows.forEach(win => enableAppShortcuts(null, win));

      // Enable shortcut on future windows
      app.on('browser-window-created', enableAppShortcuts);

      shortcutsOfWindow.removeListener = () => {
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(win =>
          win.webContents.removeListener('before-input-event', keyHandler)
        );
        app.removeListener('browser-window-created', enableAppShortcuts);
      };
    } else {
      const keyHandler = _onBeforeInput(shortcutsOfWindow);
      wc.on('before-input-event', keyHandler);

      // Save a reference to allow remove of listener from elsewhere
      shortcutsOfWindow.removeListener = () =>
        wc.removeListener('before-input-event', keyHandler);
      wc.once('closed', shortcutsOfWindow.removeListener);
    }
  }

  const eventStamp = acceleratorToEvent(accelerator);

  shortcutsOfWindow.push({
    eventStamp,
    callback,
    enabled: true
  });
}

/**
 * Unregisters the shortcut of `accelerator` registered on the BrowserWindow instance.
 * @param  {BrowserWindow} win - BrowserWindow instance to unregister.
 * This argument could be omitted, in this case the function unregister the shortcut
 * on all app windows. If you registered the shortcut on a particular window instance, it will do nothing.
 * @param  {String|Array<String>} accelerator - the shortcut to unregister
 */
function unregister (win, accelerator) {
  let wc;
  if (typeof accelerator === 'undefined') {
    wc = ANY_WINDOW;
    accelerator = win;
  } else {
    if (win.isDestroyed()) {
      return;
    }
    wc = win.webContents;
  }
  if (Array.isArray(accelerator) === true) {
    accelerator.forEach(accelerator => {
      if (typeof accelerator === 'string') {
        unregister(win, accelerator);
      }
    });
    return;
  }

  _checkAccelerator(accelerator);

  if (!windowsWithShortcuts.has(wc)) {
    return;
  }

  const shortcutsOfWindow = windowsWithShortcuts.get(wc);

  const eventStamp = acceleratorToEvent(accelerator);
  const shortcutIdx = _findShortcut(eventStamp, shortcutsOfWindow);
  if (shortcutIdx === -1) {
    return;
  }

  shortcutsOfWindow.splice(shortcutIdx, 1);

  // If the window has no more shortcuts, we remove it early from the WeakMap and unregistering the event listener
  if (shortcutsOfWindow.length === 0) {
    // Remove listener from window
    shortcutsOfWindow.removeListener();

    // Remove window from shortcuts catalog
    windowsWithShortcuts.delete(wc);
  }
}

/**
 * Returns `true` or `false` depending on whether the shortcut `accelerator`
 * is registered on `window`.
 * @param  {BrowserWindow} win - BrowserWindow instance to check. This argument
 * could be omitted, in this case the function returns whether the shortcut
 * `accelerator` is registered on all app windows. If you registered the
 * shortcut on a particular window instance, it return false.
 * @param  {String} accelerator - the shortcut to check
 * @return {Boolean} - if the shortcut `accelerator` is registered on `window`.
 */
function isRegistered (win, accelerator) {
  _checkAccelerator(accelerator);
}

module.exports = {
  register,
  unregister,
  isRegistered,
  unregisterAll,
  enableAll,
  disableAll
};
