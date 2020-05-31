module.exports = (str) =>
  str
    .split('-')
    .map((s, i) => (
      i === 0
        ? s
        : s[0].toUpperCase() + s.slice(1)
    ))
    .join('');
