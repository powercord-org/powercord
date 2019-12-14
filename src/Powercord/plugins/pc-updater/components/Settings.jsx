const { React, getModule, constants: { Routes } } = require('powercord/webpack');
const { Clickable, Button, FormNotice, FormTitle, Tooltip } = require('powercord/components');
const { SwitchItem, TextInput, Category, ButtonItem } = require('powercord/components/settings');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { REPO_URL } = require('powercord/constants');
const { clipboard } = require('electron');

const Icons = require('./Icons');
const Update = require('./Update');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
    this.state = {
      opened: false,
      pathsRevealed: false,
      pluginsRevealed: false,
      debugInfoOpened: false,
      copied: false
    };
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
            <span>{powercord.gitInfos.upstream.replace(REPO_URL, 'Official')}</span>
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
          : (!checking && !updating && <>
            {updates.length > 0 && <Button
              size={Button.Sizes.SMALL}
              color={failed ? Button.Colors.RED : Button.Colors.GREEN}
              onClick={() => failed ? this.plugin.askForce() : this.plugin.doUpdate()}
            >
              {failed ? 'Force Update' : 'Update Now'}
            </Button>}
            <Button
              size={Button.Sizes.SMALL}
              onClick={() => this.plugin.checkForUpdates(true)}
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
          </>)}
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
          onChange={val => this.props.updateSetting('interval', (Number(val) && Number(val) >= 10) ? Math.ceil(Number(val)) : 10, 15)}
          defaultValue={this.props.getSetting('interval', 15)}
          required={true}
        >
          Update Check Interval
        </TextInput>
        <TextInput
          note='How many concurrent tasks Powercord will run in background to check for updates. Minimum 1. If unsure, leave 2.'
          onChange={val => this.props.updateSetting('concurrency', (Number(val) && Number(val) >= 1) ? Math.ceil(Number(val)) : 1, 2)}
          defaultValue={this.props.getSetting('concurrency', 2)}
          required={true}
        >
          Update Concurrency Limit
        </TextInput>
        <ButtonItem
          note={'Missed the changelog, or want to see it again?'}
          button='Open Change Logs'
          onClick={() => this.plugin.openChangeLogs()}
        >
          Open Change Logs
        </ButtonItem>
        <ButtonItem
          note='You can choose between the stable branch, or the development branch. Stable branch will only get major updates, security and critical updates. If unsure, stay on stable.'
          button={powercord.gitInfos.branch === 'v2' ? 'Switch to development branch' : 'Switch to stable'}
          onClick={() => this.askChangeChannel(
            powercord.gitInfos.branch === 'v2' ? 'development' : 'stable',
            () => this.plugin.changeBranch(powercord.gitInfos.branch === 'v2' ? 'v2-dev' : 'v2')
          )}
        >
          Change Release Channel
        </ButtonItem>

        <Category
          name='Debugging Information'
          description='Things that you may find useful for troubleshooting or flexing on some stats.'
          opened={this.state.debugInfoOpened}
          onChange={() => this.setState({ debugInfoOpened: !this.state.debugInfoOpened })}
        >
          {this.renderDebugInfo(moment)}
        </Category>
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

  renderDebugInfo (moment) {
    const { getRegisteredExperiments, getExperimentOverrides } = getModule([ 'initialize', 'getRegisteredExperiments' ], false);
    // eslint-disable-next-line new-cap
    const [ , buildId ] = Routes.OVERLAY().match(/build_id=([[a-f0-9]+)/);
    const sentry = window.__SENTRY__.hub;
    const plugins = powercord.pluginManager.getPlugins().filter(plugin =>
      !powercord.pluginManager.get(plugin).isInternal && powercord.pluginManager.isEnabled(plugin)
    );
    let experiments = [].concat(...[ ...powercord.pluginManager.plugins.values() ]
      .filter(plugin => plugin.experiments && plugin.experiments.length > 0)
      .map(plugin => plugin.experiments.map(experiment => ({
        [experiment]: powercord.api.settings.store.getSetting(plugin.entityID, experiment, false)
      })))
    );

    if (experiments.length > 0) {
      experiments = Object.assign(...experiments);
    } else {
      experiments = null;
    }

    const experimentOverrides = Object.keys(getExperimentOverrides()).length;
    const totalExperiments = Object.keys(getRegisteredExperiments()).length;

    const discordPath = process.resourcesPath.slice(0, -10);
    const maskPath = (path) => {
      path = path.replace(/(?:\/home\/|C:\\Users\\|\/Users\/)([ \w.-]+).*/, (path, username) => {
        const usernameIndex = path.indexOf(username);
        return [ path.slice(0, usernameIndex), username.charAt(0) + username.slice(1).replace(/[a-zA-Z]/g, '*'),
          path.slice(usernameIndex + username.length) ].join('');
      });

      return path;
    };

    const createPathReveal = (title, path) =>
      <div
        className='full-column'
        onMouseEnter={() => this.setState({ pathsRevealed: true })}
        onMouseLeave={() => this.setState({ pathsRevealed: false })}
      >
        {title}:&#10;{this.state.pathsRevealed ? path : maskPath(path)}
      </div>;

    return <FormNotice
      type={FormNotice.Types.PRIMARY}
      body={<div className='debugInfo'>
        <code>
          <b>System / Discord:</b>
          <div className='row'>
            <div className='column'>OS:&#10;{window.platform.os.toString()}</div>
            <div className='column'>Platform:&#10;{process.platform}</div>
            <div className='column'>Release Channel:&#10;{window.GLOBAL_ENV.RELEASE_CHANNEL}</div>
            <div className='column'>App Version:&#10;{sentry.getScope()._extra.hostVersion}</div>
            <div className='column'>Build Number:&#10;{sentry.getClient()._options.release}</div>
            <div className='column'>Build ID:&#10;{buildId}</div>
            <div className='column'>Experiments:&#10;{experimentOverrides} / {totalExperiments}</div>
          </div>

          <b>Process Versions:</b>
          <div className='row'>
            <div className='column'>React:&#10;{React.version}</div>
            {[ 'electron', 'chrome', 'node' ].map(pkg =>
              <div className='column'>{pkg.charAt(0).toUpperCase() + pkg.slice(1)}:&#10;{process.versions[pkg]}</div>
            )}
          </div>

          <b>Powercord:</b>
          <div className='row'>
            <div className='column'>Commands:&#10;{powercord.api.commands.commands.length}</div>
            <div className='column'>Settings:&#10;{Object.keys(powercord.api.settings.store.settings).length}</div>
            <div className='column'>Plugins:&#10;{powercord.pluginManager.getPlugins()
              .filter(plugin => powercord.pluginManager.isEnabled(plugin)).length} / {powercord.pluginManager.plugins.size}
            </div>
            <div className='column'>Themes:&#10;{powercord.styleManager.getThemes()
              .filter(theme => powercord.styleManager.isEnabled(theme)).length} / {powercord.styleManager.themes.size}
            </div>
            <div className='column'>Experiments:&#10;{(experiments && `${Object.keys(experiments)
              .filter(experiment => experiments[experiment]).length} / ${Object.keys(experiments).length}`) || 'n/a'}
            </div>
            <div className='column'>{`Settings Sync:\n${powercord.settings.get('settingsSync', false)}`}</div>
            {powercord.cacheFolder &&
            <div className='column'>Cached Files:&#10;{require('fs')
              .readdirSync(`${powercord.cacheFolder}/jsx`, (_, files) => files).length}
            </div>
            }
            <div className='column'>{`Account:\n${!!powercord.account}`}</div>
            <div className='column'>APIs:&#10;{powercord.apiManager.apis.length}</div>
          </div>

          <b>Git:</b>
          <div className='row'>
            <div className='column'>Upstream:&#10;{powercord.gitInfos.upstream}</div>
            <div className='column'>Revision:&#10;
              <a
                href={`https://github.com/${powercord.gitInfos.upstream}/commit/${powercord.gitInfos.revision}`}
                target='_blank'
              >
                [{powercord.gitInfos.revision.substring(0, 7)}]
              </a>
            </div>
            <div className='column'>Branch:&#10;{powercord.gitInfos.branch}</div>
            <div
              className='column'>{`Latest:\n${!this.props.getSetting('updates', []).find(update => update.id === 'powercord')}`}</div>
          </div>

          <b>Listings:</b>
          <div className='row'>
            {createPathReveal('Powercord Path', powercord.basePath)}
            {createPathReveal('Discord Path', discordPath)}
            <div
              className='full-column'>Experiments:&#10;{(getExperimentOverrides() && Object.keys(getExperimentOverrides()).join(', ')) || 'n/a'}</div>
            <div className='full-column'>
              Plugins:&#10;{(plugins.length > 1 && `${(this.state.pluginsRevealed ? plugins : plugins.slice(0, 6)).join(', ')}; `) || 'n/a'}
              {plugins.length > 1 &&
              <Clickable tag='a' onClick={() => this.setState({ pluginsRevealed: !this.state.pluginsRevealed })}>
                {this.state.pluginsRevealed ? 'Show less' : 'Show more'}
              </Clickable>}
            </div>
          </div>
        </code>
        <Button
          size={Button.Sizes.SMALL}
          color={this.state.copied ? Button.Colors.GREEN : Button.Colors.BRAND}
          onClick={() => this.handleDebugInfoCopy(moment)}
        >
          {this.state.copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>}
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

  askChangeChannel (channel, callback) {
    this._ask(
      `Change release channel to ${channel}`,
      'Are you sure you want to change your release channel? Powercord will reload your Discord client.',
      'Switch',
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

  // --- HANDLERS
  handleDebugInfoCopy (moment) {
    const extract = document.querySelector('.debugInfo > code')
      .innerText.replace(/(.*?):(?=\s(?!C:\\).*?:)/g, '\n[$1]').replace(/(.*?):\s(.*.+)/g, '$1="$2"').replace(/[ -](\w*(?=.*=))/g, '$1');

    this.setState({ copied: true });
    clipboard.writeText(
      `\`\`\`ini
      # Debugging Information | Result created: ${moment().calendar()}
      ${extract.substring(0, extract.indexOf('\nPlugins', extract.indexOf('\nPlugins') + 1))}
      Plugins="${powercord.pluginManager.getPlugins().filter(plugin => !powercord.pluginManager.get(plugin).isInternal &&
        powercord.pluginManager.isEnabled(plugin)).join(', ')}"
      \`\`\``.replace(/ {6}|n\/a/g, '').replace(/(?![0-9]{1,3}) \/ (?=[0-9]{1,3})/g, '/')
    );
    setTimeout(() => this.setState({ copied: false }), 2500);
  }
};
