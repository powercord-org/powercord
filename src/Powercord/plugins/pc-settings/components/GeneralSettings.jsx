const { remote } = require('electron');
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { FontAwesome } } = require('powercord/components');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { TextInput, SwitchItem, ButtonItem, Category } = require('powercord/components/settings');
const { Confirm } = require('powercord/components/modal');
const { WEBSITE, CACHE_FOLDER } = require('powercord/constants');
const { rmdirRf } = require('powercord/util');

const PassphraseModal = require('./PassphraseModal.jsx');
const Account = require('./PowercordAccount');

module.exports = class GeneralSettings extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      discordCleared: false,
      powercordCleared: false
    };
  }

  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return (
      <div>
        <Account
          passphrase={this.passphrase.bind(this)}
          onAccount={() => this.forceUpdate()}
        />
        <TextInput
          defaultValue={getSetting('prefix', '.')}
          onChange={p => updateSetting('prefix', !p ? '.' : p)}
        >
          {Messages.POWERCORD_COMMAND_PREFIX}
        </TextInput>
        <SwitchItem
          note={Messages.POWERCORD_SETTINGS_SYNC_DESC}
          value={powercord.account && getSetting('settingsSync', false)}
          disabled={!powercord.account}
          onChange={() => {
            if (!getSetting('settingsSync', false)) {
              this.passphrase(true);
            } else {
              toggleSetting('settingsSync');
            }
          }}
        >
          {Messages.POWERCORD_SETTINGS_SYNC}
        </SwitchItem>
        <SwitchItem
          note={Messages.POWERCORD_SETTINGS_NO_CLYDE_DESC.format({ discordiaUrl: 'https://discordia.me/clyde' })}
          value={getSetting('replaceClyde', true)}
          onChange={() => toggleSetting('replaceClyde', true)}
        >
          {Messages.POWERCORD_SETTINGS_NO_CLYDE}&ensp;<FontAwesome icon='robot'/>
        </SwitchItem>

        <Category
          name={Messages.ADVANCED_SETTINGS}
          description={Messages.POWERCORD_SETTINGS_ADVANCED_DESC}
          opened={getSetting('advancedSettings', false)}
          onChange={() => toggleSetting('advancedSettings')}
        >
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_DEBUG_LOGS_DESC}
            value={getSetting('debugLogs', false)}
            onChange={() => {
              toggleSetting('debugLogs');
              this.askRestart();
            }}
          >
            {Messages.POWERCORD_SETTINGS_DEBUG_LOGS}
          </SwitchItem>
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_OVERLAY_DESC}
            value={getSetting('openOverlayDevTools', false)}
            onChange={() => toggleSetting('openOverlayDevTools')}
          >
            {Messages.POWERCORD_SETTINGS_OVERLAY}
          </SwitchItem>
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_KEEP_TOKEN_DESC}
            value={getSetting('hideToken', true)}
            onChange={() => toggleSetting('hideToken', true)}
          >
            {Messages.POWERCORD_SETTINGS_KEEP_TOKEN}
          </SwitchItem>
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_TRANSPARENT_DESC.format()}
            value={getSetting('transparentWindow', false)}
            onChange={() => {
              toggleSetting('transparentWindow');
              this.askRestart();
            }}
          >
            {Messages.POWERCORD_SETTINGS_TRANSPARENT}
          </SwitchItem>
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_EXP_WEB_PLATFORM_DESC.format()}
            value={getSetting('experimentalWebPlatform', false)}
            onChange={() => {
              toggleSetting('experimentalWebPlatform');
              this.askRestart();
            }}
          >
            {Messages.POWERCORD_SETTINGS_EXP_WEB_PLATFORM}
          </SwitchItem>
          <SwitchItem
            note={Messages.POWERCORD_SETTINGS_DISCORD_EXPERIMENTS_DESC.format()}
            value={getSetting('experiments', false)}
            onChange={async () => {
              toggleSetting('experiments');
              // Update modules
              const experimentsModule = await getModule(r => r.isDeveloper !== void 0);
              experimentsModule._changeCallbacks.forEach(cb => cb());
            }}
          >
            {Messages.POWERCORD_SETTINGS_DISCORD_EXPERIMENTS}
          </SwitchItem>
          <TextInput
            value={getSetting('backendURL', WEBSITE)}
            onChange={p => updateSetting('backendURL', !p ? WEBSITE : p)}
            note={Messages.POWERCORD_SETTINGS_BACKEND_DESC}
          >
            {Messages.POWERCORD_SETTINGS_BACKEND}
          </TextInput>
        </Category>
        <ButtonItem
          note={Messages.POWERCORD_SETTINGS_CACHE_POWERCORD_DESC}
          button={this.state.powercordCleared ? Messages.POWERCORD_SETTINGS_CACHE_CLEARED : Messages.POWERCORD_SETTINGS_CACHE_POWERCORD}
          success={this.state.powercordCleared}
          onClick={() => this.clearPowercordCache()}
        >
          {Messages.POWERCORD_SETTINGS_CACHE_POWERCORD}
        </ButtonItem>
        <ButtonItem
          note={Messages.POWERCORD_SETTINGS_CACHE_DISCORD_DESC}
          button={this.state.discordCleared ? Messages.POWERCORD_SETTINGS_CACHE_CLEARED : Messages.POWERCORD_SETTINGS_CACHE_DISCORD}
          success={this.state.discordCleared}
          onClick={() => this.clearDiscordCache()}
        >
          {Messages.POWERCORD_SETTINGS_CACHE_DISCORD}
        </ButtonItem>
      </div>
    );
  }

  passphrase (updateSync = false) {
    openModal(() => <PassphraseModal
      onConfirm={(passphrase) => {
        this.props.updateSetting('passphrase', passphrase);
        closeModal();
        if (updateSync) {
          this.props.toggleSetting('settingsSync');
        }
      }}
      onCancel={closeModal}
    />);
  }

  clearDiscordCache () {
    this.setState({ discordCleared: true });
    remote.getCurrentWindow().webContents.session.clearCache(() => void 0);
    setTimeout(() => {
      this.setState({ discordCleared: false });
    }, 2500);
  }

  clearPowercordCache () {
    this.setState({ powercordCleared: true });
    // noinspection JSDeprecatedSymbols
    rmdirRf(CACHE_FOLDER).then(() => require.extensions['.jsx'].ensureFolder());
    setTimeout(() => {
      this.setState({ powercordCleared: false });
    }, 2500);
  }

  askRestart () {
    openModal(() => <Confirm
      red
      header={Messages.ERRORS_RESTART_APP}
      confirmText={Messages.BUNDLE_READY_RESTART}
      cancelText={Messages.BUNDLE_READY_LATER}
      onConfirm={() => window.reloadElectronApp()}
      onCancel={closeModal}
    >
      <div className='powercord-text'>
        {Messages.POWERCORD_SETTINGS_RESTART}
      </div>
    </Confirm>);
  }
};
