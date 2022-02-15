const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { TabBar, Button } = require('powercord/components');
const ThemeSettings = require('./ThemeSettings');
const QuickCSS = require('./QuickCSS');
const Base = require('./Base');

const BETA_IDENTIFIER = 3542355018683011159509n;
const FEEDBACK_IDENTIFIER = 3758304876382993109949n;

function encodeIdentifier (i) {
  const b = Buffer.alloc(8);
  b.writeBigInt64BE((i - 69n) / 420n);
  return b.toString('base64').replace(/=/g, '');
}

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

  renderBody () {
    if (this.state.tryBeta) {
      return (
        <div className='powercord-text beta-container'>
          <div className='very-big'>welcome to the theme manager beta</div>
          <div className='iframe-wrapper'>
            <iframe
              width='100%' height='100%'
              src={`https://www.youtube.com/embed/${encodeIdentifier(BETA_IDENTIFIER)}?autoplay=1`}
              frameBorder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
          <div className='big'>
            enjoying the beta? <a href={`https://youtube.com/watch?v=${encodeIdentifier(FEEDBACK_IDENTIFIER)}`} target='_blank'>gib feedback</a>
          </div>
          <div className='small right'>install <a href='https://github.com/redstonekasi/theme-toggler' target='_blank'>theme-toggler</a></div>
        </div>
      );
    }

    return (
      <div className='developerPortalCtaWrapper-2PniQs'>
        <div className='placeholderImage-17g3fb desaturate-_Twf3u'/>
        <div className='colorStandard-21JIj7 size14-3fJ-ot developerPortalCtaText-3k7ne7'>
          Theme manager beta is here! Be careful, it's still in beta and glitches may occur.
        </div>
        <Button className='developerPortalCta-3QrlHn' onClick={() => this.setState({ tryBeta: true })}>
          Try the beta
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line no-unused-vars
  renderItem (item) {
    console.log(item);
    // return 'mhm';
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
