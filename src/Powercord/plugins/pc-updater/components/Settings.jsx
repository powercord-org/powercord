/* eslint-disable */
const { React, getModule } = require('powercord/webpack');
const { Button, FormNotice } = require('powercord/components');
const { SwitchItem, TextInput } = require('powercord/components/settings');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const Icons = require('./Icons');
const Update = require('./Update');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
  }

  render () {
    const moment = getModule([ 'momentProperties' ], false);
    const awaitingReload = this.props.getSetting('awaiting_reload', false);
    const updating = this.props.getSetting('updating', false);
    const checking = this.props.getSetting('checking', false);
    const disabled = this.props.getSetting('disabled', false);
    const paused = this.props.getSetting('paused', false);

    const updates = this.props.getSetting('updates', []);
    const checkingProgress = this.props.getSetting('checking_progress', [ 0, 0 ]);
    const last = moment(this.props.getSetting('last_check', false)).calendar();

    return <div className='powercord-updater powercord-text'>
      {awaitingReload && <FormNotice
        imageData={{
          width: 60,
          height: 60,
          src: '/assets/0694f38cb0b10cc3b5b89366a0893768.svg'
        }}
        type={FormNotice.Types.WARNING}
        title='Reload Required'
        body={<>
          <p>Some updates require a client reload to complete.</p>
          <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.YELLOW}
            look={Button.Looks.INVERTED}
            onClick={() => window.reload()}
          >
            Reload Discord
          </Button>
        </>}
      />}
      <div className='top-section'>
        <div className='icon'>
          {disabled
            ? <Icons.Update color='#f04747'/>
            : paused
              ? <Icons.Paused/>
              : (checking || updating)
                ? <Icons.Update color='#7289da' animated/>
                : updates.length > 0
                  ? <Icons.Update/>
                  : <Icons.UpToDate/>}
        </div>
        <div className='status'>
          <h3>
            {disabled
              ? 'Updates are disabled.'
              : paused
                ? 'Updates are paused.'
                : checking
                  ? 'Checking for updates...'
                  : updating
                    ? 'Updating Powercord...'
                    : updates.length > 0
                      ? 'Updates are available.'
                      : 'Powercord is up to date.'}
          </h3>
          {!disabled && !updating && (!checking || checkingProgress[1] > 0) && <div>
            {paused
              ? 'They will resume on next reload.'
              : checking
                ? `Checking ${checkingProgress[0]}/${checkingProgress[1]}`
                : `Last checked: ${last}`}
          </div>}
        </div>
        <div className="about">
          <div>
            <span>Upstream:</span>
            <span>{powercord.gitInfos.upstream.replace('powercord-org/powercord', 'Official')}</span>
          </div>
          <div>
            <span>Branch:</span>
            <span>{powercord.gitInfos.branch}</span>
          </div>
          <div>
            <span>Revision:</span>
            <span>{powercord.gitInfos.revision.substring(0, 7)}</span>
          </div>
        </div>
      </div>
      <div className='buttons'>
        {disabled || paused
          ? <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.GREEN}
            onClick={() => {
              this.props.updateSetting('paused', false);
              this.props.updateSetting('disabled', false);
            }}
          >
            {disabled ? 'Enable' : 'Resume'} Updates
          </Button>
          : !checking && !updating && <>
          {updates.length > 0 && <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.GREEN}
            onClick={() => this.plugin.doUpdate()}
          >
            Update Now
          </Button>}
          <Button
            size={Button.Sizes.SMALL}
            onClick={() => this.plugin.checkForUpdates()}
          >
            Check for Updates
          </Button>
          <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.YELLOW}
            onClick={() => this.askPauseUpdates()}
          >
            Pause updates
          </Button>
          <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.RED}
            onClick={() => this.askDisableUpdates(null, () => this.props.updateSetting('disabled', true))}
          >
            Disable updates
          </Button>
        </>}
      </div>
      {!disabled && !paused && !checking && <div className='updates'>
        {updates.map(update => <Update
          key={update.repo}
          updating={updating}
          {...update}
        />)}
      </div>}

      {!disabled && <>
        <SwitchItem
          value={this.props.getSetting('background', false)}
          onChange={() => this.props.toggleSetting('background')}
          note={'Powercord can download and install updates in background without annoying you too much. Note that updates will require user action if a reload is required, or if there is a conflict.'}
        >
          Update automatically in background
        </SwitchItem>

        <TextInput
          note='How frequently Powercord will check for updates (in minutes).'
          onChange={val => this.props.updateSetting('interval', (Number(val) && Number(val) >= 1) ? Number(val) : 1, 15)}
          defaultValue={this.props.getSetting('interval', 15)}
          required={true}
        >
          Update Check Interval
        </TextInput>
      </>}
    </div>;
  }

  // --- PROMPTS
  askSkipUpdate (entity, callback) {
    this._ask(
      'Skip an update',
      `Are you sure you want to skip this ${entity} update? Powercord will wait for a newer version to get released before updating again.`,
      'Skip update',
      callback
    );
  }

  askPauseUpdates () {
    this._ask(
      'Pause updates',
      'Are you sure you want to pause updates? Powercord won\'t check for updates until next reload.',
      'Pause updates',
      () => this.props.updateSetting('paused', true)
    );
  }

  askDisableUpdates (entity, callback) {
    this._ask(
      entity ? `Disable ${entity} updates` : 'Disable updates',
      `Are you sure you want to disable updates${entity ? ` for ${entity}` : ''}? You will have to perform updates manually.`,
      'Disable updates',
      callback
    );
  }

  _ask (title, content, confirm, callback, red = true) {
    openModal(() => <Confirm
      red={red}
      header={title}
      confirmText={confirm}
      cancelText='Cancel'
      onConfirm={callback}
      onCancel={closeModal}
    >
      <div className='powercord-text'>{content}</div>
    </Confirm>);
  }
};
