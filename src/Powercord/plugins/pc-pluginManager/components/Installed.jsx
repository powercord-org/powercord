const { React } = require('powercord/webpack');
const { Button, Switch, Divider } = require('powercord/components');
const { TextInput } = require('powercord/components/settings');
const Plugin = require('./Plugin');

const awaitingReload = [];

module.exports = class Installed extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      hidden: false,
      search: ''
    };
  }

  render () {
    const plugins = this._getPlugins();

    return <div className='powercord-plugins'>
      <div className='powercord-plugins-wip'>This part of Powercord is a WIP. Except unavailable features and crashes here</div>
      <div className='powercord-plugins-header'>
        <h3>Installed plugins</h3>
        <Button onClick={() => this.props.goToExplore()}>Explore Plugins</Button>
      </div>
      <Divider/>
      <div className='powercord-plugins-topbar'>
        <TextInput
          value={this.state.search}
          onChange={v => this.setState({ search: v })}
          placeholder='What are you looking for?'
        >
          Search plugins...
        </TextInput>
        <div className='powercord-plugins-topbar-show'>
          <span>Show hidden plugins</span>
          <Switch value={this.state.hidden} onChange={() => this.setState({ hidden: !this.state.hidden })}/>
        </div>
      </div>
      <div className='powercord-plugins-container'>
        {plugins.map(plugin => <Plugin
          id={plugin.pluginID}
          installed={!powercord.pluginManager.hiddenPlugins.includes(plugin.pluginID)}
          awaitingReload={awaitingReload.includes(plugin.pluginID)}
          enabled={powercord.pluginManager.isEnabled(plugin.pluginID)}
          enforced={powercord.pluginManager.isEnforced(plugin.pluginID)}
          manifest={plugin.manifest}

          onEnable={() => this.enable(plugin.pluginID)}
          onDisable={() => this.disable(plugin.pluginID)}

          onInstall={() => this.install(plugin.pluginID)}
          onUninstall={() => this.uninstall(plugin.pluginID)}
        />)}
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

  async install (pluginID) {
    await powercord.pluginManager.install(pluginID);
    awaitingReload.push(pluginID);
    this.forceUpdate();
  }

  async uninstall (pluginID) {
    await powercord.pluginManager.uninstall(pluginID);
    awaitingReload.push(pluginID);
    this.forceUpdate();
  }

  _getPlugins () {
    let plugins = powercord.pluginManager.getPlugins();
    if (this.state.hidden) {
      plugins.push(...powercord.pluginManager.getHiddenPlugins());
    }

    plugins = plugins.map(p => powercord.pluginManager.plugins.get(p));

    if (this.state.search !== '') {
      const search = this.state.search.toLowerCase();
      plugins = plugins.filter(p =>
        p.manifest.name.toLowerCase().includes(search) ||
        p.manifest.author.toLowerCase().includes(search) ||
        p.manifest.description.toLowerCase().includes(search)
      );
    }

    return plugins.sort((a, b) => {
      const nameA = a.manifest.name.toLowerCase();
      const nameB = b.manifest.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
  }
};
