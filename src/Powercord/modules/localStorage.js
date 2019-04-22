module.exports = () => {
  const iframe = document.createElement('iframe');
  window.localStorage = document.body
    .appendChild(iframe)
    .contentWindow
    .localStorage;
};
