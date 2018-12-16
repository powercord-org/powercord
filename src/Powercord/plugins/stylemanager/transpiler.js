onmessage = (data) => {
  const id = data.data[0];
  let css = data.data[1];
  const discordClassNames = data.data[2];

  css.match(/((?:\s|^)(?:[^}/]*?))\s*{/ig).forEach(selectorsRaw => {
    if (selectorsRaw.includes('keyframes')) {
      return;
    }
    const selectorsRawFormatted = selectorsRaw.replace('{', '').trim();
    let formattedSelector = selectorsRawFormatted;
    const selectorsRawSplitted = selectorsRaw.replace('{', '').trim().split(',');
    selectorsRawSplitted.forEach(selectorRaw => {
      const selector = selectorRaw.trim();
      const selectorMatch = selector.match(/(?:\[class[\^*]=["']?([a-z0-9]+)-?["']?])+/ig);
      if (selectorMatch) {
        selectorMatch.forEach(sel => {
          sel.match(/\[class[\^*]=["']?([a-z0-9]+)-?]/ig).forEach(s => {
            const c = s.split('=')[1].split(']')[0].replace('-', '');
            if (discordClassNames.includes(c)) {
              formattedSelector = formattedSelector.replace(s, `.pc-${c}`);
            }
          });
        });
      }
    });

    css = css.replace(selectorsRawFormatted, formattedSelector);
  });

  postMessage([ id, css ]);
};
