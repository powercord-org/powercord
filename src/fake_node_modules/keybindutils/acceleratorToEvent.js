// Taken from https://github.com/parro-it/keyboardevent-from-electron-accelerator, licensed under MIT license

const modifiers = /^(CommandOrControl|CmdOrCtrl|Command|Cmd|Control|Ctrl|AltGr|Option|Alt|Shift|Super)/i;
const keyCodes = /^(Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen|F24|F23|F22|F21|F20|F19|F18|F17|F16|F15|F14|F13|F12|F11|F10|F9|F8|F7|F6|F5|F4|F3|F2|F1|[0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]'])/i;
const UNSUPPORTED = {};

function reduceModifier ({ accelerator, event }, modifier) {
  switch (modifier) {
    case 'command':
    case 'cmd': {
      if (process.platform !== 'darwin') {
        return UNSUPPORTED;
      }

      if (event.metaKey) {
        throw new Error('Double `Command` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { metaKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }
    case 'super': {
      if (event.metaKey) {
        throw new Error('Double `Super` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { metaKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }
    case 'control':
    case 'ctrl': {
      if (event.ctrlKey) {
        throw new Error('Double `Control` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { ctrlKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }
    case 'commandorcontrol':
    case 'cmdorctrl': {
      if (process.platform === 'darwin') {
        if (event.metaKey) {
          throw new Error('Double `Command` modifier specified.');
        }

        return {
          event: Object.assign({}, event, { metaKey: true }),
          accelerator: accelerator.slice(modifier.length)
        };
      }

      if (event.ctrlKey) {
        throw new Error('Double `Control` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { ctrlKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }
    case 'option':
    case 'altgr':
    case 'alt': {
      if (modifier === 'option' && process.platform !== 'darwin') {
        return UNSUPPORTED;
      }

      if (event.altKey) {
        throw new Error('Double `Alt` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { altKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }
    case 'shift': {
      if (event.shiftKey) {
        throw new Error('Double `Shift` modifier specified.');
      }

      return {
        event: Object.assign({}, event, { shiftKey: true }),
        accelerator: accelerator.slice(modifier.length)
      };
    }

    default:
      console.error(modifier);
  }
}

function reducePlus ({ accelerator, event }) {
  return {
    event,
    accelerator: accelerator.trim().slice(1)
  };
}

const virtualKeyCodes = {
  0: 'Digit0',
  1: 'Digit1',
  2: 'Digit2',
  3: 'Digit3',
  4: 'Digit4',
  5: 'Digit5',
  6: 'Digit6',
  7: 'Digit7',
  8: 'Digit8',
  9: 'Digit9',
  '-': 'Minus',
  '=': 'Equal',
  Q: 'KeyQ',
  W: 'KeyW',
  E: 'KeyE',
  R: 'KeyR',
  T: 'KeyT',
  Y: 'KeyY',
  U: 'KeyU',
  I: 'KeyI',
  O: 'KeyO',
  P: 'KeyP',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  A: 'KeyA',
  S: 'KeyS',
  D: 'KeyD',
  F: 'KeyF',
  G: 'KeyG',
  H: 'KeyH',
  J: 'KeyJ',
  K: 'KeyK',
  L: 'KeyL',
  ';': 'Semicolon',
  '\'': 'Quote',
  '`': 'Backquote',
  '/': 'Backslash',
  Z: 'KeyZ',
  X: 'KeyX',
  C: 'KeyC',
  V: 'KeyV',
  B: 'KeyB',
  N: 'KeyN',
  M: 'KeyM',
  ',': 'Comma',
  '.': 'Period',
  '\\': 'Slash',
  ' ': 'Space'
};

function reduceKey ({ accelerator, event }, key) {
  if (key.length > 1 || event.key) {
    throw new Error(`Unvalid keycode \`${key}\`.`);
  }

  const code =
    key.toUpperCase() in virtualKeyCodes
      ? virtualKeyCodes[key.toUpperCase()]
      : null;

  return {
    event: Object.assign({}, event, { key }, code ? { code } : null),
    accelerator: accelerator.trim().slice(key.length)
  };
}

const domKeys = Object.assign(Object.create(null), {
  plus: 'Add',
  space: ' ',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  insert: 'Insert',
  return: 'Return',
  enter: 'Return',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  escape: 'Escape',
  esc: 'Escape',
  volumeup: 'AudioVolumeUp',
  volumedown: 'AudioVolumeDown',
  volumemute: 'AudioVolumeMute',
  medianexttrack: 'MediaTrackNext',
  mediaprevioustrack: 'MediaTrackPrevious',
  mediastop: 'MediaStop',
  mediaplaypause: 'MediaPlayPause',
  printscreen: 'PrintScreen'
});

// Add function keys
for (let i = 1; i <= 24; i++) {
  domKeys[`f${i}`] = `F${i}`;
}

function reduceCode ({ accelerator, event }, { code, key }) {
  if (event.code) {
    throw new Error(`Duplicated keycode \`${key}\`.`);
  }

  return {
    event: Object.assign({}, event, { key }, code ? { code } : null),
    accelerator: accelerator.trim().slice((key && key.length) || 0)
  };
}

/**
 * This function transform an Electron Accelerator string into
 * a DOM KeyboardEvent object.
 *
 * @param  {string} accelerator an Electron Accelerator string, e.g. `Ctrl+C` or `Shift+Space`.
 * @return {object} a DOM KeyboardEvent object derivate from the `accelerator` argument.
 */
module.exports = function toKeyEvent (accelerator) {
  let state = {
    accelerator,
    event: {}
  };
  while (state.accelerator !== '') {
    const modifierMatch = state.accelerator.match(modifiers);
    if (modifierMatch) {
      const modifier = modifierMatch[0].toLowerCase();
      state = reduceModifier(state, modifier);
      if (state === UNSUPPORTED) {
        return { unsupportedKeyForPlatform: true };
      }
    } else if (state.accelerator.trim()[0] === '+') {
      state = reducePlus(state);
    } else {
      const codeMatch = state.accelerator.match(keyCodes);
      if (codeMatch) {
        const code = codeMatch[0].toLowerCase();
        if (code in domKeys) {
          state = reduceCode(state, {
            code: domKeys[code],
            key: code
          });
        } else {
          state = reduceKey(state, code);
        }
      } else {
        throw new Error(`Unvalid accelerator: "${state.accelerator}"`);
      }
    }
  }
  return state.event;
};
