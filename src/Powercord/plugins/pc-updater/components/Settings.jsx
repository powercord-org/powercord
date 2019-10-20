const { React } = require('powercord/webpack');
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
    const disabled = this.props.getSetting('disabled', false);
    const paused = this.props.getSetting('paused', false);

    return <div className='powercord-updater'>
      <div className='top-section'>
        <div className='icon'>
          {disabled
            ? <Icons.UpdatesAvailable color='#f04747'/>
            : paused
              ? <Icons.Paused/>
              : <Icons.UpToDate/>}
        </div>
        <div className='status'>
          <h3>
            {disabled
              ? 'Updates are disabled.'
              : paused
                ? 'Updates are paused.'
                : 'Powercord is up to date.'}
          </h3>
          {!disabled && !paused && <div>Last checked: Today at 18:58</div>}
        </div>
      </div>
      <div className='buttons'>
        {disabled
          ? <Button
            size={Button.Sizes.SMALL}
            color={Button.Colors.GREEN}
            onClick={() => this.props.updateSetting('disabled', false)}
          >
            Enable Updates
          </Button>
          : !paused && <>
          <Button size={Button.Sizes.SMALL} color={Button.Colors.GREEN}>Update Now</Button>
          <Button size={Button.Sizes.SMALL}>Check for Updates</Button>
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
      {!disabled && !paused && <div className='updates'>
        <Update
          {...fakeData[0]}
          onSkip={() => this.askSkipUpdate(fakeData[0].name, () => console.log('cool'))}
          onDisable={() => this.askDisableUpdates(fakeData[0].name, () => console.log('cool'))}
        />
        <Update
          {...fakeData[1]}
          onSkip={() => this.askSkipUpdate(fakeData[1].name, () => console.log('cool'))}
          onDisable={() => this.askDisableUpdates(fakeData[1].name, () => console.log('cool'))}
        />
        <Update
          {...fakeData[2]}
          onSkip={() => this.askSkipUpdate(fakeData[2].name, () => console.log('cool'))}
          onDisable={() => this.askDisableUpdates(fakeData[2].name, () => console.log('cool'))}
        />
      </div>}

      {!disabled && <>
        <SwitchItem
          value={this.props.getSetting('background', false)}
          onChange={() => this.props.toggleSetting('background')}
          note={'Powercord can download and install updates in background without annoying you too much. Updates that require a client reload won\'t automatically reload the client.'}
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

  _ask (title, content, confirm, callback) {
    openModal(() => <Confirm
      red
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
