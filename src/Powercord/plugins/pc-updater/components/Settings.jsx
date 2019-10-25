const { React, getModule } = require('powercord/webpack');
const { Button, FormNotice, FormTitle, Tooltip } = require('powercord/components');
const { SwitchItem, TextInput, Category, ButtonItem } = require('powercord/components/settings');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');

const Icons = require('./Icons');
const Update = require('./Update');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
    this.state = { opened: false };
  }

  render () {
    const isUnsupported = window.GLOBAL_ENV.RELEASE_CHANNEL !== 'canary';
    const moment = getModule([ 'momentProperties' ], false);
    const awaitingReload = this.props.getSetting('awaiting_reload', false);
    const updating = this.props.getSetting('updating', false);
    const checking = this.props.getSetting('checking', false);
    const disabled = this.props.getSetting('disabled', false);
    const paused = this.props.getSetting('paused', false);
    const failed = this.props.getSetting('failed', false);

    const updates = this.props.getSetting('updates', []);
    const disabledEntities = this.props.getSetting('entities_disabled', []);
    const checkingProgress = this.props.getSetting('checking_progress', [ 0, 0 ]);
    const last = moment(this.props.getSetting('last_check', false)).calendar();

    let icon,
      title;
    if (disabled) {
      icon = <Icons.Update color='#f04747'/>;
      title = 'Updates are disabled.';
    } else if (paused) {
      icon = <Icons.Paused/>;
      title = 'Updates are paused.';
    } else if (checking) {
      icon = <Icons.Update color='#7289da' animated/>;
      title = 'Checking for updates...';
    } else if (updating) {
      icon = <Icons.Update color='#7289da' animated/>;
      title = 'Updating Powercord...';
    } else if (failed) {
      icon = <Icons.Error/>;
      title = 'Some updates failed';
    } else if (updates.length > 0) {
      icon = <Icons.Update/>;
      title = 'Updates are available.';
    } else {
      icon = <Icons.UpToDate/>;
      title = 'Powercord is up to date.';
    }

    return <div className='powercord-updater powercord-text'>
      {awaitingReload
        ? this.renderReload()
        : isUnsupported && this.renderUnsupported()}
      <div className='top-section'>
        <div className='icon'>{icon}</div>
        <div className='status'>
          <h3>{title}</h3>
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
            <span>Revision:</span>
            <span>{powercord.gitInfos.revision.substring(0, 7)}</span>
          </div>
          <div>
            <span>Branch:</span>
            <span>{powercord.gitInfos.branch}</span>
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
            color={failed ? Button.Colors.RED : Button.Colors.GREEN}
            onClick={() => failed ? this.plugin.askForce() : this.plugin.doUpdate()}
          >
            {failed ? 'Force Update' : 'Update Now'}
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
      {!disabled && !paused && !checking && updates.length > 0 && <div className='updates'>
        {updates.map(update => <Update
          {...update}
          key={update.id}
          updating={updating}
          onSkip={() => this.askSkipUpdate(update.name, () => this.plugin.skipUpdate(update.id, update.commits[0].id))}
          onDisable={() => this.askDisableUpdates(update.name, () => this.plugin.disableUpdates(update))}
        />)}
      </div>}

      {disabledEntities.length > 0 && <Category
        name='Disabled updates'
        opened={this.state.opened}
        onChange={() => this.setState({ opened: !this.state.opened })}
      >
        {disabledEntities.map(entity => <div key={entity.id} className='update'>
          <div className='title'>
            <div className='icon'>
              <Tooltip text={entity.icon} position='left'>
                {React.createElement(Icons[entity.icon])}
              </Tooltip>
            </div>
            <div className='name'>{entity.name}</div>
            <div className='actions'>
              <Button color={Button.Colors.GREEN} onClick={() => this.plugin.enableUpdates(entity.id)}>
                Enable Updates
              </Button>
            </div>
          </div>
        </div>)}
      </Category>}
      <FormTitle className='powercord-updater-ft'>Options</FormTitle>
      {!disabled && <>
        <SwitchItem
          value={this.props.getSetting('automatic', false)}
          onChange={() => this.props.toggleSetting('automatic')}
          note={'Powercord can download and install updates in background without annoying you too much. Note that updates will require user action if a reload is required, or if there is a conflict.'}
        >
          Update automatically in background
        </SwitchItem>
        <TextInput
          note='How frequently Powercord will check for updates (in minutes). Minimum 10 minutes.'
          onChange={val => this.props.updateSetting('interval', (Number(val) && Number(val) >= 10) ? Number(val) : 10, 15)}
          defaultValue={this.props.getSetting('interval', 15)}
          required={true}
        >
          Update Check Interval
        </TextInput>
        <ButtonItem
          note={'Missed the changelog, or want to see it again?'}
          button='Open Change Logs'
          disabled={this.state.cleaning}
          onClick={() => this.plugin.openChangeLogs()}
        >
          Open Change Logs
        </ButtonItem>
      </>}
    </div>;
  }

  // --- PARTS
  renderReload () {
    const body = <>
      <p>Some updates require a client reload to complete.</p>
      <Button
        size={Button.Sizes.SMALL}
        color={Button.Colors.YELLOW}
        look={Button.Looks.INVERTED}
        onClick={() => location.reload()}
      >
        Reload Discord
      </Button>
    </>;
    return this._renderFormNotice('Reload Required', body);
  }

  renderUnsupported () {
    const body = <p>You're using an unsupported build of Discord ({window.GLOBAL_ENV.RELEASE_CHANNEL}). Plugins and
      themes might not fully work on this build, and you may experience crashes.</p>;
    return this._renderFormNotice('Unsupported Discord version', body);
  }

  _renderFormNotice (title, body) {
    return <FormNotice
      imageData={{
        width: 60,
        height: 60,
        src: '/assets/0694f38cb0b10cc3b5b89366a0893768.svg'
      }}
      type={FormNotice.Types.WARNING}
      title={title}
      body={body}
    />;
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
