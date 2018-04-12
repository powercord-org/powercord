const ID = '325648177178869760';
const caseRegex = /#(\d+)/g;

module.exports = async function DBLPlugin () {
  this.StateWatcher.on('switchChannel', () => {
    if (window.location.pathname.split('/').pop() === ID) {
      const prompt = (() => {
        const div = document.createElement('div');
        div.innerHTML = 'Press tab to insert case.';
        div.id = 'dbl-prompt';
        div.className = 'markup';
        div.style.opacity = 0;

        return div;
      })();

      document.querySelector('form').appendChild(prompt);

      const cases = document.querySelectorAll('.embedAuthorName-29phCh');
      const { innerHTML: lastCase } = cases[cases.length - 1];
      const caseNumber = `${lastCase.match(caseRegex)[0].slice(1)} `;

      const ta = document.querySelector('textarea');
      ta.onkeyup = function (event) {
        if (!this.value) {
          prompt.style.opacity = 0;
        }

        if (this.value.startsWith('-r') && !this.value.includes(caseNumber)) {
          prompt.style.opacity = 1;
          if (event.key === 'Tab') {

            ta.focus();
            ta.selectionStart = ta.value.length;
            ta.selectionEnd = ta.value.length;
            document.execCommand('insertText', false, caseNumber);

            prompt.style.opacity = 0;
          }
        }
      };
    }
  });
};
