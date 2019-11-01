const { React } = require('powercord/webpack');

const Header = require('./Header');
const Container = require('./Container');
const Permissions = require('./Permissions');
const Footer = require('./Footer');

module.exports = class Plugin extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      installing: false
    };
  }

  render () {
    const {
      id, installed, enabled, manifest, // Properties
      onEnable, onDisable, onInstall, onUninstall // Events
    } = this.props;

    return <div className='powercord-plugin'>
      <Header
        name={manifest.name}
        installed={installed}
        enabled={enabled}
        onEnable={onEnable}
        onDisable={onDisable}
      />
      <Container
        author={manifest.author}
        version={manifest.version}
        description={manifest.description}
        license={manifest.license}
      />
      {(manifest.permissions || []).length > 0 && <Permissions permissions={manifest.permissions}/>}
      <Footer
        id={id}
        installed={installed}
        installing={this.state.installing}
        onUninstall={() => this.process(onUninstall)}
        onInstall={() => this.process(onInstall)}
      />
    </div>;
  }

  async process (func) {
    this.setState({ installing: true });
    await func();
    this.setState({ installing: false });
  }
};
