const { React } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { TextInput, SwitchItem } = require('powercord/components/settings');

const PassphraseModal = require('./PassphraseModal.jsx');
const Account = require('./PowercordAccount');

module.exports = class GeneralSettings extends React.Component {
  constructor () {
    super();

    const get = powercord.settings.get.bind(powercord.settings);

    this.state = {
      prefix: get('prefix', '.'),
      settingsSync: get('settingsSync', false),
      openOverlayDevTools: get('openOverlayDevTools', false),
      backendURL: get('backendURL', 'https://powercord.xyz'),
      experiments: get('experiments', false),
      advancedSettings: get('advancedSettings', false)
    };
  }

  render () {
    const settings = this.state;

    return (
      <div>
        <Account passphrase={this.passphrase.bind(this)} onAccount={() => this.forceUpdate()}/>

        <TextInput
          defaultValue={settings.prefix}
          required={true}
          onChange={e => this._set('prefix', e, '.')}
        >
          Command Prefix
        </TextInput>

        <SwitchItem
          note='Sync all of your Powercord settings across devices. Requires a Powercord account'
          value={powercord.account && settings.settingsSync}
          disabled={!powercord.account}
          onChange={() => {
            if (!settings.settingsSync) {
              this.passphrase(true);
            } else {
              this._set('settingsSync');
            }
          }}
        >
          Settings Sync
        </SwitchItem>

        <SwitchItem
          note={
            <span>Exercise caution changing anything in this category if you don't know what you're doing. <b>Seriously.</b></span>
          }
          value={settings.advancedSettings}
          onChange={() => this._set('advancedSettings')}
        >
          Advanced Settings
        </SwitchItem>
        {settings.advancedSettings && (
          <div>
            <TextInput
              value={settings.backendURL}
              required={true}
              onChange={(e) => this._set('backendURL', e, 'https://powercord.xyz')}
              note='Url used for Spotify linking, plugin management and other internal functions'
            >
              Backend URL
            </TextInput>

            <SwitchItem
              note='Should Powercord open overlay devtools when it gets injected (useful for developing themes)'
              value={settings.openOverlayDevTools}
              onChange={() => this._set('openOverlayDevTools')}
            >
              Overlay DevTools
            </SwitchItem>

            <SwitchItem
              note={
                <span><b style={{ color: 'rgb(240, 71, 71)' }}>WARNING:</b> Enabling this gives you access to features that can be <b>detected by Discord</b> and may result in an <b
                  style={{ color: 'rgb(240, 71, 71)' }}>account termination</b>.
                  Powercord is <b>not responsible</b> for what you do with this feature. Leave it disabled if you are unsure.</span>
              }
              value={settings.experiments}
              onChange={() => this._set('experiments')}
            >
              Enable Discord Experiments
            </SwitchItem>
          </div>
        )}
      </div>
    );
  }

  passphrase (updateSync = false) {
    openModal(() => <PassphraseModal
      onConfirm={(passphrase) => {
        powercord.settings.set('passphrase', passphrase);
        closeModal();
        if (updateSync) {
          this._set('settingsSync');
        }
      }}
      onCancel={() => {
        closeModal();
        if (updateSync) {
          this._set('settingsSync');
        }
      }}
    />);
  }

  _set (key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    powercord.settings.set(key, value);
    this.setState({
      [key]: value
    });
  }
};
