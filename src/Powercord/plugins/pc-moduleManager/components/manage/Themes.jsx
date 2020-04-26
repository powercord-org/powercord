const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { TabBar } = require('powercord/components');
const QuickCSS = require('./QuickCSS');
const Base = require('./Base');

class Themes extends Base {
  constructor () {
    super();
    this.state.tab = 'INSTALLED';
    this.ConnectedQuickCSS = powercord.pluginManager.get('pc-moduleManager').settings.connectStore(QuickCSS);
  }

  render () {
    const { topPill, item } = getModule([ 'topPill' ], false);
    const { ConnectedQuickCSS } = this;

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
        {this.state.tab === 'INSTALLED' ? super.render() : <ConnectedQuickCSS popoutComponent={ConnectedQuickCSS}/>}
      </>
    );
  }

  renderBody () {
    return <div className='powercord-plugin-soon powercord-text'>
      <div className='wumpus'>
        <img src='/assets/8c998f8fb62016fcfb4901e424ff378b.svg' alt='wumpus'/>
      </div>
      <p>{Messages.POWERCORD_THEMES_WIP1}</p>
      <p>{Messages.POWERCORD_THEMES_WIP2}</p>
    </div>;
  }

  // eslint-disable-next-line no-unused-vars
  renderItem (item) {
    // console.log(item);
    return 'mhm';
  }

  fetchMissing () { // @todo: better impl + i18n
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._fetchEntities('themes');
  }

  getItems () {
    return this._sortItems([ ...powercord.styleManager.themes.values() ].filter(t => t.isTheme));
  }
}

module.exports = Themes;
