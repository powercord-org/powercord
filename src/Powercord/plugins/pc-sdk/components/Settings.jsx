const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

class Settings extends React.PureComponent {
  render () {
    return (
      <div id='sdk-settings' className='category'>
        <h2>SDK Settings</h2>
        <SwitchItem
          note={Messages.POWERCORD_SETTINGS_OVERLAY_DESC}
          value={this.props.getSetting('openOverlayDevTools', false)}
          onChange={() => this.props.toggleSetting('openOverlayDevTools')}
        >
          {Messages.POWERCORD_SETTINGS_OVERLAY}
        </SwitchItem>
        <SwitchItem
          note={<>
            Binds useful short aliases to the developer tools' console, letting you test things out more quickly.
            You can find a full reference of available aliases in <a href='#'>the documentation</a>.
          </>}
          value={this.props.getSetting('openOverlayDevTools', false)}
          onChange={() => this.props.toggleSetting('openOverlayDevTools')}
        >
          DevTools Shortcuts
        </SwitchItem>
        <SwitchItem
          note={<>
            Loads React DevTools extension in Electron, letting you look at the React tree and debug stuff more
            easily. <b>Requires restart</b>.<br/><br/>
            <strong><strong>NOTE:</strong></strong> on <b>Windows</b> installations, enabling this might make Discord
            unusable without Powercord due to a <a href='https://github.com/electron/electron/issues/19468' target='_blank'>bug in Electron</a>.
            More details in our <a href='#'>troubleshooting guide</a>.
          </>}
          value={this.props.getSetting('reactDevTools', false)}
          onChange={() => {
            this.props.toggleSetting('reactDevTools');
            this.askRestart();
          }}
        >
          Enable React DevTools
        </SwitchItem>
        <SwitchItem
          note={<>
            Loads required code to hook into the standalone React DevTools. <b>Requires restart</b>.
          </>}
          value={this.props.getSetting('openOverlayDevTools', false)}
          onChange={() => this.props.toggleSetting('openOverlayDevTools')}
        >
          Listen for Standalone React Devtools
        </SwitchItem>
      </div>
    );
  }

  askRestart () {
    openModal(() => <Confirm
      red
      header={Messages.ERRORS_RESTART_APP}
      confirmText={Messages.BUNDLE_READY_RESTART}
      cancelText={Messages.BUNDLE_READY_LATER}
      onConfirm={() => DiscordNative.app.relaunch()}
      onCancel={closeModal}
    >
      <div className='powercord-text'>
        {Messages.POWERCORD_SETTINGS_RESTART}
      </div>
    </Confirm>);
  }
}

module.exports = Settings;
