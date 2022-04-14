function _init () {
  powercord.api.router.registerRoute({
    path: '/dev-lands',
    render: () => 'Why is your cat so damn fat'
  });

  // Imagine here I setup a setInterval that throws an error every 10ms :eyes:
}

function _shut () {
  powercord.api.router.unregisterRoute('/dev-lands');
}

module.exports = function () {
  // const styleId = loadStyle(join(__dirname, 'style/style.scss'));
  powercord.api.labs.registerExperiment({
    id: 'pc-dev-lands',
    name: 'Developer Lands',
    date: 1598446784383,
    description: 'Heaven but for plugin & theme developers',
    callback: (enabled) => enabled ? _init() : _shut()
  });

  if (powercord.api.labs.isExperimentEnabled('pc-dev-lands')) {
    _init();
  }

  return () => {
    // unloadStyle(styleId);
    powercord.api.labs.unregisterExperiment('pc-dev-lands');
    _shut();
  };
};
