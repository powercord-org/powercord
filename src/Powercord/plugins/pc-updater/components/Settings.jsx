const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');
const { SwitchItem, TextInput } = require('powercord/components');

const Icons = require('./Icons');
const Update = require('./Update');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
  }

  render () {
    return <div className='powercord-updater'>
      <div className='top-section'>
        <div className='icon'>
          <Icons.UpToDate/>
        </div>
        <div className='status'>
          <h3>Powercord is up to date</h3>
          <div>Last checked: Today at 18:58</div>
        </div>
      </div>
      <div className='buttons'>
        <Button size={Button.Sizes.SMALL} color={Button.Colors.GREEN}>Update Now</Button>
        <Button size={Button.Sizes.SMALL}>Check for Updates</Button>
        <Button size={Button.Sizes.SMALL} color={Button.Colors.RED}>Disable updates</Button>
      </div>
      <div className='updates'>
        <Update {...fakeData[0]}/>
        <Update {...fakeData[1]}/>
        <Update {...fakeData[2]}/>
      </div>

      <SwitchItem
        value={this.props.getSetting('background', false)}
        onChange={() => this.props.toggleSetting('background')}
        note={'Powercord can download and install updates in background without annoying you too much. Updates that requires a client reload won\'t automatically reload the client.'}
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
    </div>;
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
