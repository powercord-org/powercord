const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, PopoutWindow, Spinner, Clickable, Tooltip, Icons: { ExternalLink, Pin, Unpin, Close } } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const { ErrorBoundary } = powercord.api.settings;
const SettingsView = AsyncComponent.from((async () => {
  const StandardSidebarView = await getModuleByDisplayName('StandardSidebarView');
  const SettingsView = await getModuleByDisplayName('SettingsView');

  class DocsSidebarView extends StandardSidebarView {
    renderTools () {
      if (this.props.popout) {
        return null;
      }
      const res = super.renderTools();
      res.props.children.props.children = [
        res.props.children.props.children,
        <Tooltip text={Messages.POPOUT_PLAYER} position='bottom'>
          <Clickable
            onClick={this.props.onPopout}
            className='powercord-docs-button'
          >
            <ExternalLink/>
          </Clickable>
        </Tooltip>
      ];
      return res;
    }
  }

  class DocsSettingsView extends SettingsView {
    render () {
      const res = super.render();
      if (!res) {
        return null;
      }
      res.props.popout = this.props.popout;
      res.props.onPopout = this.props.onPopout;
      res.type = DocsSidebarView;
      if (this.props.popout) {
        return (
          <>
            <div className='powercord-documentation-titlebar'>
              <Tooltip
                text={this.props.windowOnTop ? Messages.POPOUT_REMOVE_FROM_TOP : Messages.POPOUT_STAY_ON_TOP}
                position='left'
              >
                <Clickable
                  onClick={() => getModule([ 'setAlwaysOnTop', 'open' ], false)
                    .setAlwaysOnTop('DISCORD_POWERCORD_DOCUMENTATION', !this.props.windowOnTop)}
                  className='button'
                >
                  {this.props.windowOnTop ? <Unpin/> : <Pin/>}
                </Clickable>
              </Tooltip>
              <Tooltip text={Messages.CLOSE_WINDOW} position='left'>
                <Clickable onClick={() => this.props.guestWindow.close()} className='button'>
                  <Close/>
                </Clickable>
              </Tooltip>
            </div>
            {res}
          </>
        );
      }
      return res;
    }
  }

  return DocsSettingsView;
})());
const DocPage = require('./DocPage');

let sectionsCache = [
  {
    section: 'loading',
    label: 'Loading...',
    element: () => <Spinner/>
  }
];

class DocsLayer extends React.Component {
  constructor () {
    super();
    this.state = {
      sections: sectionsCache,
      section: 'loading'
    };
  }

  async componentDidMount () {
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    const sections = await get(`${baseUrl}/api/v2/docs/categories`).then(res => res.body).then(s => s.sort((a, b) => a.metadata.pos > b.metadata.pos ? 1 : -1));
    sectionsCache = [];
    sections.forEach(section => {
      sectionsCache.push(
        { section: 'DIVIDER' },
        {
          section: 'HEADER',
          label: section.metadata.name
        },
        ...section.docs.map(doc => ({
          section: `${section.id}/${doc.id}`,
          label: doc.name,
          element: () => <ErrorBoundary>
            <DocPage category={section.id} doc={doc.id} setSection={section => this.setState({ section })}/>
          </ErrorBoundary>
        }))
      );
    });
    sectionsCache.shift();
    this.setState({
      sections: sectionsCache,
      section: sectionsCache[1].section
    });

    if (this.props.popout) {
      const styleMain = document.querySelector('#powercord-css-pc-docs').outerHTML;
      const styleCode = document.querySelector('#powercord-css-pc-codeblocks').outerHTML;
      this.props.guestWindow.document.head.innerHTML += styleMain;
      this.props.guestWindow.document.head.innerHTML += styleCode;
    }
  }

  render () {
    return <SettingsView
      onPopout={() => this.openPopout()}
      onClose={() => getModule([ 'popLayer' ], false).popLayer()}
      onSetSection={section => this.setState({ section })}
      sections={this.state.sections}
      section={this.state.section}
      theme={this.props.theme}
      sidebarTheme={this.props.sidebarTheme}
      guestWindow={this.props.guestWindow}
      windowOnTop={this.props.windowOnTop}
      popout={this.props.popout}
    />;
  }

  openPopout () {
    getModule([ 'popLayer' ], false).popLayer();
    getModule([ 'setAlwaysOnTop', 'open' ], false).open('DISCORD_POWERCORD_DOCUMENTATION', () => (
      <PopoutWindow windowId='DISCORD_POWERCORD_DOCUMENTATION'>
        <ConnectedDocsLayer popout={true}/>
      </PopoutWindow>
    ));
  }
}

const ConnectedDocsLayer = Flux.connectStoresAsync(
  [ getModule([ 'theme' ]), getModule([ 'darkSidebar' ]), getModule([ 'getWindow' ]) ],
  ([ themeStore, sidebarStore, windowStore ]) => ({
    guestWindow: windowStore.getWindow('DISCORD_POWERCORD_DOCUMENTATION'),
    windowOnTop: windowStore.getIsAlwaysOnTop('DISCORD_POWERCORD_DOCUMENTATION'),
    sidebarTheme: sidebarStore.darkSidebar ? 'dark' : void 0,
    theme: themeStore.theme
  })
)(DocsLayer);

module.exports = ConnectedDocsLayer;
