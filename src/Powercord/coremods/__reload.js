module.exports = function () {
  require('.').unload();
  Object.keys(require.cache).forEach(key => {
    if (key.includes('src/Powercord/coremods')) {
      delete require.cache[key];
    }
  });
  require('.').load();
};
