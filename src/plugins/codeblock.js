module.exports = async function codeblock () {
  this.StateWatcher.on('codeblock', codeblock => {
    codeblock.innerHTML = '<ol>' + codeblock.innerHTML
      .split('\n')
      .map(l => `<li>${l}</li>`)
      .join('') + '</ol>';

    codeblock.appendChild((() => {
      const btn = document.createElement('button');
      btn.className = 'aethcord-copycode-btn';
      btn.innerHTML = 'Copy';
      btn.onclick = () => {
        btn.classList.add('success');
        setTimeout(() => btn.classList.remove('success'), 1000);

        const range = document.createRange();
        range.selectNode(codeblock.children[0]);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
      };

      return btn;
    })());
  });
};
