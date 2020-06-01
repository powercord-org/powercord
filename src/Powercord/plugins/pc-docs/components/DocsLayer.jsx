const { React, Flux, getModule } = require('powercord/webpack');
const { PopoutWindow, Spinner } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');
const DocPage = require('./DocPage');
const SettingsView = require('./SettingsView');

let sectionsCache = [
  {
    section: 'loading',
    label: 'Loading...',
    element: () => <Spinner/>
  }
];

class DocsLayer extends React.PureComponent {
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
          element: () => (
            <DocPage category={section.id} doc={doc.id} setSection={section => this.setState({ section })}/>
          )
        }))
      );
    });
    sectionsCache.shift();
    this.setState({
      sections: sectionsCache,
      section: sectionsCache[1].section
    });
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
    getModule([ 'setAlwaysOnTop', 'open' ], false).open('DISCORD_POWERCORD_DOCUMENTATION', (key) => (
      <PopoutWindow windowKey={key}>
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
