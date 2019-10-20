const { React } = require('powercord/webpack');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
  }

  render () {
    return <div>
      cool
    </div>;
  }
};
