const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Card, Tooltip, Switch, Button, Divider } = require('powercord/components');
const { Confirm } = require('powercord/components/modal');

const Permissions = require('../parts/Permissions');
const Details = require('../parts/Details');
const Base = require('./Base');

class Plugins extends Base {
  renderItem (item) {
    const enabled = powercord.pluginManager.isEnabled(item.entityID);
    const hasPermissions = item.manifest.permissions && item.manifest.permissions.length > 0;
    return (
      <Card className='powercord-product'>
        <div className='powercord-product-header'>
          <h4>{item.manifest.name}</h4>
          <Tooltip text={enabled ? Messages.DISABLE : Messages.ENABLE} position='top'>
            <div>
              <Switch value={enabled} onChange={v => this._toggle(item.entityID, v.target.checked)}/>
            </div>
          </Tooltip>
        </div>
        <Divider/>
        <Details
          svgSize={24}
          author={item.manifest.author}
          version={item.manifest.version}
          description={item.manifest.description}
          license={item.manifest.license}
        />
        {hasPermissions && <>
          <Divider/>
          <Permissions svgSize={22} permissions={item.manifest.permissions}/>
        </>}
        {!item.entityID.startsWith('pc-') && <>
          <Divider/>
          <div className='powercord-product-footer'>
            <Button
              onClick={() => this._uninstall(item.entityID)}
              color={Button.Colors.RED}
              look={Button.Looks.FILLED}
              size={Button.Sizes.SMALL}
            >
              {Messages.APPLICATION_CONTEXT_MENU_UNINSTALL}
            </Button>
          </div>
        </>}
      </Card>
    );
  }

  getItems () {
    return this._sortItems([ ...powercord.pluginManager.plugins.values() ]);
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('plugins');
  }

  _toggle (pluginID, enabled) {
    let fn;
    let plugins;
    if (enabled) {
      plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependencies);
      fn = powercord.pluginManager.enable.bind(powercord.pluginManager);
    } else {
      plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependents);
      fn = powercord.pluginManager.disable.bind(powercord.pluginManager);
    }

    const apply = async () => {
      for (const plugin of plugins) {
        await fn(plugin);
      }
    };

    if (plugins.length === 1) {
      return apply();
    }

    const title = enabled
      ? Messages.POWERCORD_PLUGINS_ENABLE
      : Messages.POWERCORD_PLUGINS_DISABLE;
    const note = enabled
      ? Messages.POWERCORD_PLUGINS_ENABLE_NOTE
      : Messages.POWERCORD_PLUGINS_DISABLE_NOTE;
    openModal(() => (
      <Confirm
        red={!enabled}
        header={title}
        confirmText={title}
        cancelText={Messages.CANCEL}
        onConfirm={async () => {
          await apply();
          this.forceUpdate();
          closeModal();
        }}
        onCancel={closeModal}
      >
        <div className='powercord-products-modal'>
          <span>{note}</span>
          <ul>
            {plugins.map(p => <li key={p.id}>{powercord.pluginManager.get(p).manifest.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }

  _uninstall (pluginID) {
    const plugins = [ pluginID ].concat(powercord.pluginManager.get(pluginID).dependents);
    openModal(() => (
      <Confirm
        red
        header={Messages.POWERCORD_PLUGINS_UNINSTALL.format({ pluginCount: plugins.length })}
        confirmText={Messages.POWERCORD_PLUGINS_UNINSTALL.format({ pluginCount: plugins.length })}
        cancelText={Messages.CANCEL}
        onCancel={closeModal}
        onConfirm={async () => {
          for (const plugin of plugins) {
            await powercord.pluginManager.uninstall(plugin);
          }
          this.forceUpdate();
          closeModal();
        }}
      >
        <div className='powercord-products-modal'>
          <span>{Messages.POWERCORD_PLUGINS_UNINSTALL_SURE.format({ pluginCount: plugins.length })}</span>
          <ul>
            {plugins.map(p => <li key={p.id}>{powercord.pluginManager.get(p).manifest.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }
}

module.exports = Plugins;
