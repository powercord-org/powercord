const { React } = require('powercord/webpack');

const Header = require('./Header');
const Plugins = require('./Plugins');

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

module.exports = (type, experimental) =>
  class Layout extends React.Component {
    constructor (props) {
      super(props);
      this.state = { search: '' };
      this.openFolder = () => DiscordNative.fileManager.showItemInFolder(`${things[type].folder}/.`);
    }

    render () {
      const Component = things[type].component;
      return <div className='powercord-entities-manage powercord-text'>
        <Header
          type={type} experimental={experimental} search={this.state.search}
          onSearch={search => this.setState({ search })} onOpenFolder={this.openFolder}
        />
        <Component search={this.state.search}/>
      </div>;
    }
  };
