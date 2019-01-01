const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');
const Plugin = require('./Plugin');

const awaitingReload = [];

module.exports = class Installed extends React.Component {
  render () {
    return <div className='powercord-plugins'>
      <div className='powercord-plugins-header'>
        <h3>Installed plugins</h3>
        <Button onClick={() => this.props.goToExplore()}>Explore Plugins</Button>
      </div>
      <div className='powercord-plugins-container'>
        {Array.from(powercord.pluginManager.plugins.keys()).map(key => {
          const plugin = powercord.pluginManager.plugins.get(key);
          return <Plugin
            id={plugin.pluginID}
            installed={true}
            awaitingReload={awaitingReload.includes(plugin.pluginID)}
            enabled={powercord.pluginManager.isEnabled(plugin.pluginID)}
            enforced={powercord.pluginManager.isEnforced(plugin.pluginID)}
            manifest={plugin.manifest}

            onEnable={() => this.enable(plugin.pluginID)}
            onDisable={() => this.disable(plugin.pluginID)}

            onInstall={() => this.install(plugin.pluginID)}
            onUninstall={() => this.uninstall(plugin.pluginID)}
          />;
        })}
      </div>
    </div>;
  }

  enable (pluginID) {
    console.log('soon:tm:');
    // powercord.pluginManager.enable(pluginID);
    this.forceUpdate();
  }

  disable (pluginID) {
    console.log('soon:tm:');
    // powercord.pluginManager.disable(pluginID);
    this.forceUpdate();
  }

  install (pluginID) {
    console.log('soon:tm:');
    awaitingReload.push(pluginID);
    this.forceUpdate();
  }

  uninstall (pluginID) {
    console.log('soon:tm:');
    awaitingReload.push(pluginID);
    this.forceUpdate();
  }
};
