const Plugin = require('@ac/plugin');

module.exports = class StateWatcher extends Plugin {
  constructor () {
    super({
      stage: 2
    });

    this.observer = null;
  }

  start () {
    this.observer = new MutationObserver(this.onMutation.bind(this));
    this.observer.observe(document.querySelector('#app-mount'), {
      childList: true,
      subtree: true
    });
  }

  onMutation (mutations) {
    for (const mutation of mutations) {
      if (!mutation.addedNodes[0]) {
        continue;
      }

      for (const node of [ ...mutation.addedNodes ].concat(...mutation.removedNodes)) {
        if (!node.classList) {
          continue;
        }

        const codeblocks = node.querySelectorAll('.hljs');
        if (codeblocks[0]) {
          for (const codeblock of codeblocks) {
            this.emit('codeblock', codeblock);
          }
        }
      }
    }
  }
};
