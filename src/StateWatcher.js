let EventEmitter;
try {
  EventEmitter = require('eventemitter3');
} catch (_) {
  EventEmitter = require('events');
}

module.exports = class StateWatcher extends EventEmitter {
  constructor () {
    super();

    this.observer = new MutationObserver(this.onMutation.bind(this));
    this.observer.observe(document.querySelector('#app-mount'), {
      childList: true,
      subtree: true
    });
  }

  async onMutation (mutations) {
    for (const mutation of mutations) {
      if (!mutation.addedNodes[0]) continue;

      for (const node of Array.prototype.slice.call(mutation.addedNodes, 0).concat(mutation.removedNodes)) {
        if (!node.classList) continue;

        const codeblocks = node.querySelectorAll('code.hljs');
        for (const codeblock of codeblocks) {
          this.emit('codeblock', codeblock);
        }

        if (node.classList.contains('channelTextArea-1HTP3C')) {
          this.emit('switchChannel');
        }
      }
    }
  }
};
