/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { createElement } = require('powercord/util');
const { resolveCompiler } = require('powercord/compilers');

module.exports = {
  loadStyle (file) {
    const id = Math.random().toString(36).slice(2);
    const style = createElement('style', {
      id: `style-coremod-${id}`,
      'data-powercord': true,
      'data-coremod': true
    });

    document.head.appendChild(style);
    const compiler = resolveCompiler(file);
    compiler.compile().then(css => (style.innerHTML = css));
    return id;
  },

  unloadStyle (id) {
    const el = document.getElementById(`style-coremod-${id}`);
    if (el) {
      el.remove();
    }
  }
};
