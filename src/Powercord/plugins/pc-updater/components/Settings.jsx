/* eslint-disable */
const { React, getModule } = require('powercord/webpack');
const { Button } = require('powercord/components');
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
    const checking = this.props.getSetting('checking', false);
    const checkingProgress = this.props.getSetting('checking_progress', [ 0, 0 ]);
    const disabled = this.props.getSetting('disabled', false);
    const paused = this.props.getSetting('paused', false);
    const last = moment(this.props.getSetting('last_check', false)).calendar();

    return <div className='powercord-updater'>
      <div className='top-section'>
        <div className='icon'>
          {disabled
            ? <Icons.Update color='#f04747'/>
            : paused
              ? <Icons.Paused/>
              : checking
                ? <Icons.Update color='#7289da' animated/>
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
                  : 'Powercord is up to date.'}
          </h3>
          {!disabled && (!checking || checkingProgress[1] > 0) && <div>
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
          : !checking && <>
          <Button size={Button.Sizes.SMALL} color={Button.Colors.GREEN}>Update Now</Button>
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
        <Update
          {...fakeData[0]}
          onSkip={() => this.askSkipUpdate(fakeData[0].name, () => console.log('cool'))}
          onDisable={() => this.askDisableUpdates(fakeData[0].name, () => console.log('cool'))}
        />
        <Update {...fakeData[1]}/>
        <Update {...fakeData[2]} onReload={() => this.askReload()}/>
        <Update {...fakeData[3]}/>
        <Update {...fakeData[4]}/>
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

  askReload () {
    this._ask(
      'Reload Discord',
      `Are you sure you want to reload Discord now to apply updates?`,
      'Reload',
      window.reload,
      false
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
      <div className='updater-modal'>{content}</div>
    </Confirm>);
  }
};

const fakeData = [
  {
    name: 'Powercord',
    icon: 'Powercord',
    repo: 'powercord-org/powercord',
    commits: [
      {
        id: 'a415ab5cc17c8c093c015ccdb7e552aee7911aa4',
        message: 'test',
        author: 'Bowser65'
      }
    ]
  },
  {
    name: 'Powercord',
    icon: 'Powercord',
    repo: 'powercord-org/powercord',
    updating: true,
    commits: [
      {
        id: '015ccdb7e55293c015ccdb7e552aee7911aa4',
        message: 'test',
        author: 'Bowser65'
      }
    ]
  },
  {
    name: 'Powercord',
    icon: 'Powercord',
    repo: 'powercord-org/powercord',
    awaiting: true,
    commits: [
      {
        id: '11aa5ab5cc17c8c093c015ccdb7e552aee7911aa4',
        message: 'test',
        author: 'Bowser65'
      }
    ]
  },
  {
    name: 'Quick Actions',
    icon: 'Plugin',
    repo: 'griefmodz/quickActions',
    commits: [
      {
        id: '49764acfa3e8d3116bca19e1483bef39f02e04ea',
        message: 'test',
        author: 'GriefMoDz'
      },
      {
        id: 'f46fab9f9f91073a4262a6bce61dc3d05ad0a078',
        message: 'another test commit',
        author: 'GriefMoDz'
      }
    ]
  },
  {
    name: 'Customa',
    icon: 'Theme',
    repo: 'Customa/Customa-Discord',
    commits: [
      {
        id: 'c62a1190b91bc6d55417edafa8856c0bd9c93108',
        message: 'test',
        author: 'ghostlydilemma'
      },
      {
        id: '8366175c2e58728e8a393ed217a6434aa83feed4',
        message: 'cute',
        author: 'ghostlydilemma'
      }
    ]
  }
];
