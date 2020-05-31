module.exports = (time) => {
  time = Math.floor(time / 1000);
  const hours = Math.floor(time / 3600) % 24;
  const minutes = Math.floor(time / 60) % 60;
  const seconds = time % 60;
  return [ hours, minutes, seconds ]
    .map(v => v < 10 ? `0${v}` : v)
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};
