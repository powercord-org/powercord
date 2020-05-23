const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const { TabBar, Divider, Button } = require('powercord/components');

const InstalledProduct = require('../parts/InstalledProduct');

class ThemeSettings extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      theme: powercord.styleManager.get(props.theme),
      tab: 'SETTINGS'
    };
  }

  render () {
    const { theme } = this.state;
    if (!theme) {
      return this.renderWtf();
    }
    const { manifest: { name, plugins } } = theme;
    const settings = this.getApplicableSettings();
    const hasSettings = settings && settings.length !== 0;
    const hasPlugins = plugins && plugins.length !== 0;
    const hasBoth = hasSettings && hasPlugins;
    if (!hasSettings && !hasPlugins) {
      return this.renderWtf();
    }

    return (
      <div className='powercord-entities-manage powercord-text'>
        <div className='powercord-entities-manage-header'>
          <span>{name}</span>
          <div className='buttons'>
            <Button onClick={() => this.props.onClose()}>Save & Quit</Button>
          </div>
        </div>
        <Divider/>
        {hasSettings && hasPlugins && this.renderTopPills()}
        {((hasBoth && this.state.tab === 'SETTINGS') || (!hasBoth && hasSettings)) && this.renderSettings()}
        {((hasBoth && this.state.tab === 'PLUGINS') || (!hasBoth && hasPlugins)) && this.renderPlugins()}
      </div>
    );
  }

  renderTopPills () {
    const { topPill, item } = getModule([ 'topPill' ], false);
    return (
      <div className='powercord-entities-manage-tabs'>
        <TabBar
          selectedItem={this.state.tab}
          onItemSelect={tab => this.setState({ tab })}
          type={topPill}
        >
          <TabBar.Item className={item} selectedItem={this.state.tab} id='SETTINGS'>
            Theme Settings
          </TabBar.Item>
          <TabBar.Item className={item} selectedItem={this.state.tab} id='PLUGINS'>
            CSS Plugins
          </TabBar.Item>
        </TabBar>
      </div>
    );
  }

  renderSettings () {
    return (
      <>
        {this.renderSettingsGroup('Theme Settings', null)}
      </>
    );
  }

  renderSettingsGroup (groupName, settings) {
    console.log(settings);
    return groupName;
    /*
     * string
     * number
     * color
     * color_alpha
     * background
     * url
     * select
     * font
     */
  }

  renderPlugins () {
    const { manifest: { author, version, license, plugins } } = this.state.theme;
    if (plugins.length === 0) {
      return this.renderWtf();
    }
    return plugins.map(plugin => (
      <InstalledProduct
        product={{
          name: plugin.name,
          description: plugin.description,
          author: plugin.author || author,
          version: plugin.version || version,
          license: plugin.license || license
        }}
        onToggle={v => console.log('yes', v)}
      />
    ));
  }

  renderWtf () {
    return (
      <div style={{
        fontSize: 69,
        marginTop: 69,
        textAlign: 'center',
        fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
      }}>{Messages.SETTINGS_GAMES_NOT_PLAYING}</div>
    );
  }

  getApplicableSettings () { // @todo: Take plugin settings into account
    const settings = [];
    if (this.state.theme.settings) {
      settings.push({
        name: 'Theme Settings',
        options: this.state.theme.settings.options
      });
    }
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  ({ theme }) => ({
    ...powercord.api.settings._fluxProps(`theme-${theme}`)
  })
)(ThemeSettings);
