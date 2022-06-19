const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { TabBar } = require('powercord/components');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const ThemeSettings = require('./ThemeSettings');
const QuickCSS = require('./QuickCSS');
const Base = require('./Base');
const InstalledProduct = require('../parts/InstalledProduct');

class Themes extends Base {
  constructor () {
    super();
    this.state = {
      ...this.state,
      tab: 'INSTALLED',
      tryBeta: false
    };

    // this.state.settings = 'Customa-Discord';
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
        product={item.manifest}
        isEnabled={powercord.styleManager.isEnabled(item.entityID)}
        onToggle={async v => {
          await this._toggle(item.entityID, v);
          this.forceUpdate();
        }}
        onUninstall={() => this._uninstall(item.entityID)}
      />
    );
  }

  _toggle (themeID, enabled) {
    if (!enabled) {
      powercord.styleManager.disable(themeID);
    } else {
      powercord.styleManager.enable(themeID);
    }
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('themes');
  }

  getItems () {
    return this._sortItems([ ...powercord.styleManager.themes.values() ]);
  }

  _uninstall (themeID) {
    const themes = [ themeID ];
    openModal(() => (
      <Confirm
        red
        header={Messages.POWERCORD_THEMES_UNINSTALL}
        confirmText={Messages.POWERCORD_THEMES_UNINSTALL}
        cancelText={Messages.CANCEL}
        onCancel={closeModal}
        onConfirm={async () => {
          for (const [ i, theme ] of themes.entries()) {
            themes.splice(i, 1);
            try {
              await powercord.styleManager.uninstall(theme);
            } catch (err) {
              console.error(err);
            }
          }
          closeModal();
          this.forceUpdate();
        }}
      >
        <div className='powercord-products-modal'>
          <span>{Messages.POWERCORD_THEMES_UNINSTALL_SURE}</span>
          <ul>
            {themes.map(p => <li key={p}>{powercord.styleManager.get(p)?.manifest?.name}</li>)}
          </ul>
        </div>
      </Confirm>
    ));
  }
}

module.exports = Themes;
