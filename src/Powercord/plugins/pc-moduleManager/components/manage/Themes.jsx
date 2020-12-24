const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { TextInput } = require('powercord/components/settings');
const InstalledProduct = require('../parts/InstalledProduct');
const { Confirm } = require('powercord/components/modal');
const { TabBar } = require('powercord/components');
const ThemeSettings = require('./ThemeSettings');
const QuickCSS = require('./QuickCSS');
const Base = require('./Base');

class Themes extends Base {
  constructor () {
    super();
    this.state.tab = 'INSTALLED';
  }

  render () {
    if (this.state.settings) {
      return (
        <ThemeSettings theme={this.state.settings} onClose={() => this.setState({ settings: null })}/>
      );
    }

    const { topPill, item } = getModule([ 'topPill' ], false);
    return (
      <>
        <div className='powercord-entities-manage-tabs'>
          <TabBar
            selectedItem={this.state.tab}
            onItemSelect={tab => this.setState({ tab })}
            type={topPill}
          >
            <TabBar.Item className={item} selectedItem={this.state.tab} id='INSTALLED'>
              {Messages.MANAGE_USER_SHORTHAND}
            </TabBar.Item>
            <TabBar.Item className={item} selectedItem={this.state.tab} id='QUICK_CSS'>
              {Messages.POWERCORD_QUICKCSS}
            </TabBar.Item>
          </TabBar>
        </div>
        {this.state.tab === 'INSTALLED'
          ? super.render()
          : <QuickCSS openPopout={this.props.openPopout}/>}
      </>
    );
  }

  renderItem (item) {
    return (
      <InstalledProduct
          product={Object.assign({ entityID: item.entityID }, item.manifest)}
          isEnabled={item.applied}
          isAPlugin={false}
          onToggle={v => {
              if (v) powercord.styleManager.enable(item.entityID);
              else powercord.styleManager.disable(item.entityID);
          }}
          onUninstall={() => this._uninstall(item)}
      />
    );
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('themes');
  }

  getItems () {
    return this._sortItems([ ...powercord.styleManager.themes.values() ]);
  }

  _uninstall(theme) {
    openModal(() => (
      <Confirm
        red
        header={Messages.POWERCORD_THEMES_UNINSTALL}
        confirmText={Messages.POWERCORD_THEMES_UNINSTALL}
        cancelText={Messages.CANCEL}
        onCancel={closeModal}
        onConfirm={async () => {
            await powercord.styleManager.uninstall(theme.entityID);
            this.forceUpdate();
            closeModal();
        }}
      >
        <div className='powercord-products-modal'>
            <span>{Messages.POWERCORD_THEMES_UNINSTALL_SURE}</span>
            <ul>
              <li key={theme.id}>{theme.manifest.name}</li>
            </ul>
        </div>
      </Confirm>
    ));
 }
}

module.exports = Themes;
