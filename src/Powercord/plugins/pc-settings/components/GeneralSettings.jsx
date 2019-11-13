const { remote } = require('electron');
const { React, getModule } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Icons: { FontAwesome } } = require('powercord/components');
const { TextInput, SwitchItem, ButtonItem, Category } = require('powercord/components/settings');
const { Confirm } = require('powercord/components/modal');

const PassphraseModal = require('./PassphraseModal.jsx');
const Account = require('./PowercordAccount');

module.exports = class GeneralSettings extends React.Component {
  constructor () {
    super();
    this.state = { cleaning: false };
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
          Command Prefix
        </TextInput>

        <SwitchItem
          note='Sync all of your Powercord settings across devices. Requires a Powercord account!'
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
          Settings Sync
        </SwitchItem>

        <SwitchItem
          note='Disabling this makes you 10x less cool. :('
          value={getSetting('aprilFools', true)}
          onChange={() => toggleSetting('aprilFools', true)}
        >
          April Fools
        </SwitchItem>

        <SwitchItem
          note={
            <span>Replaces <a href="https://discordia.me/clyde" target="_blank">Clyde</a> in Powercord commands with a mixed range of avatars and usernames selected by plug-in developers - fallbacks to "Powercord" by default.</span>
          }
          value={getSetting('replaceClyde', true)}
          onChange={() => toggleSetting('replaceClyde', true)}
        >
          Eradicate <strike>Clyde</strike>&ensp;<FontAwesome icon='robot'/>
        </SwitchItem>

        <Category
          name='Advanced Settings'
          description={
            <span>Exercise caution changing anything in this category if you don't know what you're doing. <b>Seriously.</b></span>
          }
          opened={getSetting('advancedSettings', false)}
          onChange={() => toggleSetting('advancedSettings')}
        >
          <SwitchItem
            note='Prevents Discord from showing a warning message when opening devtools.'
            value={getSetting('yeetSelfXSS', false)}
            onChange={() => toggleSetting('yeetSelfXSS')}
          >
            Disable Self XSS warning
          </SwitchItem>
          <SwitchItem
            note2='Should Powercord open overlay devtools when it gets injected? (useful for developing themes).'
            note='Overlay support is for now broken.'
            value={getSetting('openOverlayDevTools', false)}
            onChange={() => toggleSetting('openOverlayDevTools')}
            disabled
          >
            Overlay DevTools
          </SwitchItem>

          <SwitchItem
            note='Prevents Discord from removing your token from localStorage, reducing the numbers of unwanted logouts.'
            value={getSetting('hideToken', true)}
            onChange={() => toggleSetting('hideToken', true)}
          >
            Keep token stored
          </SwitchItem>

          <SwitchItem
            note={
              <span>Makes any windows opened by Discord transparent, useful for themeing.<br/><b
                style={{ color: 'rgb(240, 71, 71)' }}>WARNING:</b> This will break <b>window snapping</b> on Windows. <b>Hardware acceleration</b> must be turned <b>off</b> on Linux.
                You may encounter issues and have black background in some cases, like when the window is cut off at the top or the bottom due to monitor resolution or when devtools are open and docked. <b>Requires restart</b>.</span>
            }
            value={getSetting('transparentWindow', false)}
            onChange={() => {
              toggleSetting('transparentWindow');
              this.askRestart();
            }}
          >
            Transparent Window
          </SwitchItem>

          <SwitchItem
            note={
              <span>Enables Chromium's experimental Web Platform features that are in development, such as CSS <code>backdrop-filter</code>. Since features are in development you may encounter issues and APIs may change at any time. <b>Requires restart</b>.</span>}
            value={getSetting('experimentalWebPlatform', false)}
            onChange={() => {
              toggleSetting('experimentalWebPlatform');
              this.askRestart();
            }}
          >
            Experimental Web Platform features
          </SwitchItem>

          <SwitchItem
            note={
              <span><b style={{ color: 'rgb(240, 71, 71)' }}>WARNING:</b> Enabling this gives you access to features that can be <b>detected by Discord</b> and may result in an <b
                style={{ color: 'rgb(240, 71, 71)' }}>account termination</b>.
                  Powercord is <b>not responsible</b> for what you do with this feature. Leave it disabled if you are unsure. The Powercord Team will not provide any support regarding any experiment.</span>
            }
            value={getSetting('experiments', false)}
            onChange={async () => {
              toggleSetting('experiments');
              // Update modules
              const experimentsModule = await getModule(r => r.isDeveloper !== void 0);
              experimentsModule._changeCallbacks.forEach(cb => cb());
            }}
          >
            Enable Discord Experiments
          </SwitchItem>
          <TextInput
            value={getSetting('backendURL', WEBSITE)}
            onChange={p => updateSetting('backendURL', !p ? WEBSITE : p)}
            note='URL used for Spotify linking, plugin management and other internal functions.'
          >
            Backend URL
          </TextInput>

        </Category>

        <ButtonItem
          note={'Removes everything stored in Discord\'s cache folder. This will temporarily make Discord slower, as all resources will have to be fetched again.'}
          button={this.state.cleaning ? 'Clearing cache...' : 'Clear cache'}
          disabled={this.state.cleaning}
          onClick={() => this.clearCache()}
        >
          Clear Cache
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

  clearCache () {
    this.setState({ clearing: true });
    remote.getCurrentWindow().webContents.session.clearCache(() => this.setState({ clearing: false }));
  }

  askRestart () {
    openModal(() => <Confirm
      red
      header='Restart Discord'
      confirmText='Restart'
      cancelText='Postpone'
      onConfirm={() => window.reloadElectronApp()}
      onCancel={closeModal}
    >
      <div className='powercord-text'>
        This setting requires you to restart Discord to take effect. Do you want to restart Discord now?
      </div>
    </Confirm>);
  }
};
