const { React } = require('powercord/webpack');
const { Card } = require('powercord/components');

const Header = require('./parts/InstalledHeader');
const Container = require('./parts/InstalledDetails');
const Permissions = require('./parts/Permissions');
const Footer = require('./parts/InstalledFooter');

module.exports = class Installed extends React.Component {
  render () {
    const {
      // @todo: more generic
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
      {(manifest.permissions || []).length > 0 && <Permissions svgSize={22} permissions={manifest.permissions}/>}
      <Footer
        id={id}
        buttons
        onUninstall={() => this.process(onUninstall)}
        onInstall={() => this.process(onInstall)}
      />
    </Card>;
  }
};
