const { React } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { open: openModal, close: closeModal } = require('powercord/modal');
const Plugin = require('../brrrrr/items/Products/Installed');

module.exports = class Plugins extends React.Component {
  render () {
    const plugins = this._getPlugins();

    return <div className='powercord-entities-manage-container'>
      {plugins.map(plugin => <Plugin
        plugin={plugin}
        key={plugin.entityID}
        enabled={powercord.pluginManager.isEnabled(plugin.entityID)}

        onEnable={() => this.toggle(plugin.entityID, false)}
        onDisable={() => this.toggle(plugin.entityID, true)}
        onUninstall={() => openModal(() => this._renderUninstall(plugin.entityID, plugins))}
      />)}
    </div>;
  }

  toggle (pluginID, disable) {
    const func = disable ? 'disable' : 'enable';
    const plugins = powercord.pluginManager.get(pluginID).dependents.filter(p => powercord.pluginManager.isEnabled(p) === disable);
    if (plugins.length !== 0) {
      openModal(() => this._renderToggle(pluginID, plugins, disable));
    } else {
      powercord.pluginManager[func](pluginID);
      this.forceUpdate();
    }
  }

  _renderToggle (plugin, plugins, disable = false) {
    return <Confirm
      red={disable}
      header={disable ? 'Disable plugins' : 'Enable plugins'}
      confirmText={disable ? 'Disable plugins' : 'Enable plugins'}
      cancelText='Cancel'
      onConfirm={async () => {
        const func = disable ? 'disable' : 'enable';
        for (const plugin of plugins) {
          await powercord.pluginManager[func](plugin);
        }
        await powercord.pluginManager[func](plugin);
        this.forceUpdate();
        closeModal();
      }}
      onCancel={closeModal}
    >
      <div className='powercord-entities-manage-modal powercord-text'>
        <span>This will also {disable ? 'disable' : 'enable'} the following plugins:</span>
        <ul>
          {plugins.map(p => <li key={p.id}>
            {powercord.pluginManager.get(p).manifest.name}
          </li>)}
        </ul>
      </div>
    </Confirm>;
  }

  _renderUninstall (plugin) {
    const plugins = powercord.pluginManager.get(plugin).dependents;
    const headerConfirm = `Uninstall plugin${plugins.length > 0 ? 's' : ''}`;
    return <Confirm
      red
      header={headerConfirm}
      confirmText={headerConfirm}
      cancelText='Cancel'
      onConfirm={async () => {
        for (const plugin of plugins) {
          await powercord.pluginManager.uninstall(plugin);
        }
        await powercord.pluginManager.uninstall(plugin);
        this.forceUpdate();
        closeModal();
      }}
      onCancel={closeModal}
    >
      <div className='powercord-entities-manage-modal powercord-text'>
        <span>Are you sure you want to uninstall this plugin?</span>
        {plugins.length > 0 && <span>This will also uninstall:</span>}
        <ul>
          {plugins.map(p => <li key={p.id}>
            {powercord.pluginManager.get(p).manifest.name}
          </li>)}
        </ul>
      </div>
    </Confirm>;
  }

  _getPlugins () {
    let plugins = [ ...powercord.pluginManager.plugins.values() ].filter(p => !p.manifest.__newManifest);
    if (this.props.search !== '') {
      const search = this.props.search.toLowerCase();
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
