const { React } = require('powercord/webpack');
const { Card } = require('powercord/components');

const Header = require('./parts/Installed/Header');
const Container = require('./parts/Installed/Details');
const Permissions = require('./parts/Permissions');
const Footer = require('./parts/Installed/Footer');

module.exports = class Installed extends React.Component {
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
        buttons
        onUninstall={() => this.process(onUninstall)}
        onInstall={() => this.process(onInstall)}
      />
    </Card>;
  }
};
