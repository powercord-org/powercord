const Plugin = require('aethcord/Structures/Plugin.js');

module.exports = class DBL extends Plugin {
  constructor (main) {
    super(main, 'DBL');

    this.ID = '325648177178869760';
    this.caseRegex = /#(\d+)/g;
    this.inject = this.inject.bind(this);
  }

  async insertText (elem, text) {
    elem.focus();
    elem.selectionStart = elem.value.length;
    elem.selectionEnd = elem.value.length;
    document.execCommand('insertText', false, text);
    console.log(text);
  }

  getLastCaseNumber () {
    const cases = document.querySelectorAll('.embedPill-3sYS1X:not([style*="rgb(65, 150, 247)"]) + .embedInner-t4ag7g .embedAuthorName-29phCh');
    const { innerHTML: lastCase } = cases[cases.length - 1];
    return `${lastCase.match(this.caseRegex)[0].slice(1)} `;
  }

  async inject () {
    if (window.location.pathname.split('/').pop() !== this.ID) return;

    const prompt = this.createElement('div', {
      innerHTML: 'Press tab to insert case.',
      id: 'dbl-prompt',
      className: 'markup',
      style: 'opacity: 0'
    });

    document.querySelector('form').appendChild(prompt);

    const caseNumber = this.getLastCaseNumber();

    const ta = document.querySelector('textarea');
    ta.onkeyup = function (main, event) {
      if (!this.value) {
        prompt.style.opacity = 0;
      }

      if (this.value.startsWith('-r') && !this.value.includes(caseNumber)) {
        prompt.style.opacity = 1;
        if (event.key === 'Tab') {
          main.insertText(ta, caseNumber);
          prompt.style.opacity = 0;
        }
      }
    }.bind(ta, this);
  }

  async load () {
    this.main.StateWatcher.on('switchChannel', this.inject);
  }

  async unload () {
    this.main.StateWatcher.removeListener('switchChannel', this.inject);
  }
};