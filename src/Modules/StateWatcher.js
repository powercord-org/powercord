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
        if (codeblocks[0]) {
          for (const codeblock of codeblocks) {
            this.emit('codeblock', codeblock);
          }
          break;
        }

        if (node.getAttribute('draggable') === 'true' && node.classList.contains('containerDefault-1bbItS')) {
          this.emit('switchChannel'); // A server switch also means a channel switch, but we're returning so it wouldn't be picked up
          return this.emit('switchServer');
        }

        if (node.classList.contains('container-iksrDt')) {
          return this.emit('userContainerReady');
        }

        if (node.classList.contains('channelTextArea-1HTP3C')) {
          return this.emit('switchChannel');
        }
      }
    }
  }
};
