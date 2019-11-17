const { React } = require('powercord/webpack');
const { Card } = require('powercord/components');

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
      plugin: { entityID: id, manifest }, enabled, // Properties
      onEnable, onDisable, onInstall, onUninstall // Events
    } = this.props;

    return <Card className='powercord-plugin'>
      <Header
        name={manifest.name}
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
        installing={this.state.installing}
        onUninstall={() => this.process(onUninstall)}
        onInstall={() => this.process(onInstall)}
      />
    </Card>;
  }

  async process (func) {
    this.setState({ installing: true });
    await func();
    this.setState({ installing: false });
  }
};
