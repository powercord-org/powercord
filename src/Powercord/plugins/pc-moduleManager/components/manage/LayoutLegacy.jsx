const { React } = require('powercord/webpack');
const { shell } = require('electron');

const Header = require('./HeaderLegacy');
const Plugins = require('./PluginsLegacy');

const things = {
  plugins: {
    folder: powercord.pluginManager.pluginDir,
    component: Plugins
  },
  themes: {
    folder: powercord.styleManager.themesDir,
    component: () => null
  }
};

module.exports = (type, experimental, fetch) =>
  class Layout extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        search: '',
        fetching: false
      };

      this.openFolder = () => shell.openItem(things[type].folder);

      this.fetchEntities = () => {
        this.setState({ fetching: true });
        fetch(type).then(async () => {
          while (powercord.api.notices.toasts['missing-entities-notify']) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          this.setState({ fetching: false });
        });
      };
    }

    render () {
      const Component = things[type].component;
      return <div className='powercord-entities-manage powercord-text'>
        <Header
          type={type} experimental={experimental} search={this.state.search}
          onSearch={search => this.setState({ search })} onOpenFolder={this.openFolder}
          onFetch={this.fetchEntities} fetching={this.state.fetching}
        />
        <Component search={this.state.search}/>
      </div>;
    }
  };
