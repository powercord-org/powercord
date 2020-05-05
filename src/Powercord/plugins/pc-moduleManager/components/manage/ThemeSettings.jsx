const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const { TabBar } = require('powercord/components');

class ThemeSettings extends React.PureComponent {
  constructor () {
    super();
    this.state = {
      theme: powercord.styleManager.get(this.props.theme),
      tab: 'SETTINGS'
    };
  }

  render () {
    const hasSettings = this.state.theme && this.state.theme.settings && this.state.theme.settings.options.length !== 0; // @todo: Take plugin settings into account
    const hasPlugins = this.state.theme && this.state.theme.plugins && this.state.theme.plugins.length !== 0;
    const hasBoth = hasSettings && hasPlugins;
    if (!this.state.theme || (!hasSettings && !hasPlugins)) {
      return (
        <div style={{
          fontSize: 69,
          marginTop: 69,
          textAlign: 'center',
          fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
        }}>{Messages.SETTINGS_GAMES_NOT_PLAYING}</div>
      );
    }

    return (
      <>
        {hasSettings && hasPlugins && this.renderTopPills()}
        {((hasBoth && this.state.tab === 'SETTINGS') || (!hasBoth && hasSettings)) && this.renderSettings()}
        {((hasBoth && this.state.tab === 'PLUGINS') || (!hasBoth && hasPlugins)) && this.renderPlugins()}
      </>
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
            Settings
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
    return 'plugins';
  }

  getApplicableSettings () {
    const settings = [];
    if (this.state.theme && this.state.theme.settings) {
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
