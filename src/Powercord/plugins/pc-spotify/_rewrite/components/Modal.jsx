const { React, Flux, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

const playerStore = require('../playerStore/store');

// eslint-disable-next-line no-unused-vars
const PanelSubtext = AsyncComponent.from(getModuleByDisplayName('PanelSubtext'));

class Modal extends React.PureComponent {
  render () {
    if (this.props.hidden) {
      return null;
    }

    return 'yeetus deletus';
  }

  renderExtraControls () {
    if (!this.props.getSetting('showControls', true)) {
      return null;
    }
  }
}

module.exports = Flux.connectStores(
  [ playerStore, powercord.api.settings.store ],
  (props) => ({
    hidden: playerStore.getDevices().length === 0,
    ...powercord.api.settings._fluxProps(props.entityID)
  })
)(Modal);
