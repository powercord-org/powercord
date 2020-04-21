const { React, Flux, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Spinner } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const { ErrorBoundary } = powercord.api.settings;
const SettingsView = AsyncComponent.from(getModuleByDisplayName('SettingsView'));
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
  }

  render () {
    return <SettingsView
      onClose={async () => (await getModule([ 'popLayer' ])).popLayer()}
      onSetSection={section => this.setState({ section })}
      sections={this.state.sections}
      section={this.state.section}
      theme={this.props.theme}
      sidebarTheme={this.props.sidebarTheme}
    />;
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme' ]), getModule([ 'darkSidebar' ]) ],
  ([ themeStore, sidebarStore ]) => ({
    sidebarTheme: sidebarStore.darkSidebar ? 'dark' : void 0,
    theme: themeStore.theme
  })
)(DocsLayer);
