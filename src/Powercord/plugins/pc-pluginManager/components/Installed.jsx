const { React } = require('powercord/webpack');
const { Button, Switch, Divider } = require('powercord/components');
const { TextInput } = require('powercord/components/settings');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { asyncArray: { map } } = require('powercord/util');
const { Confirm } = require('powercord/components/modal');
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
      <div className='powercord-plugins-wip'>This part of Powercord is a WIP. Expect unavailable features and crashes
        here
      </div>
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
          installed={true}
          awaitingReload={awaitingReload.includes(plugin.pluginID)}
          enabled={powercord.pluginManager.isEnabled(plugin.pluginID)}
          enforced={powercord.pluginManager.isEnforced(plugin.pluginID)}
          hidden={powercord.settings.get('hiddenPlugins', []).includes(plugin.pluginID)}
          manifest={plugin.manifest}

          onEnable={() => this.enable(plugin.pluginID)}
          onDisable={() => this.disable(plugin.pluginID)}

          onShow={() => this.show(plugin.pluginID)}
          onHide={() => this.hide(plugin.pluginID)}

          onInstall={() => this.install(plugin.pluginID)}
          onUninstall={() => this.uninstall(plugin.pluginID)}
        />)}
      </div>
    </div>;
  }

  async enable (pluginID) {
    const willEnable = (await powercord.pluginManager.resolveDependencies(pluginID)).filter(p => !powercord.pluginManager.isEnabled(p));
    if (willEnable.length !== 0) {
      const plugins = await map(willEnable, async p => ({
        name: await powercord.pluginManager.getPluginName(p),
        id: p
      }));

      openModal(() => this._renderEnable(pluginID, plugins));
    } else {
      powercord.pluginManager.enable(pluginID);
      this.forceUpdate();
    }
  }

  async disable (pluginID) {
    const willDisable = (await powercord.pluginManager.resolveDependents(pluginID)).filter(p => powercord.pluginManager.isEnabled(p));
    if (willDisable.length !== 0) {
      const plugins = await map(willDisable, async p => ({
        name: await powercord.pluginManager.getPluginName(p),
        id: p
      }));

      openModal(() => this._renderEnable(pluginID, plugins, true));
    } else {
      powercord.pluginManager.disable(pluginID);
      this.forceUpdate();
    }
  }

  show (pluginID) {
    powercord.pluginManager.show(pluginID);
    this.forceUpdate();
  }

  hide (pluginID) {
    powercord.pluginManager.hide(pluginID);
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

  _renderEnable (plugin, plugins, disable = false) {
    return <Confirm
      red={disable}
      header={disable ? 'Disable plugins' : 'Enable plugins'}
      confirmText={disable ? 'Disable plugins' : 'Enable plugins'}
      cancelText='Cancel'
      onConfirm={() => {
        let func = powercord.pluginManager.enable.bind(powercord.pluginManager);
        if (disable) {
          func = powercord.pluginManager.disable.bind(powercord.pluginManager);
        }

        func(plugin);
        plugins.forEach(p => func(p.id));

        this.forceUpdate();
        closeModal();
      }}
      onCancel={closeModal}
    >
      <div className='powercord-plugins-modal'>
        <span>This will also {disable ? 'disable' : 'enable'} the following plugins:</span>
        <ul>
          {plugins.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>
      </div>
    </Confirm>;
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
