const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');

class Settings extends React.PureComponent {
  render () {
    return (
      <div className='category'>
        <h2>Discord Splash Screen</h2>
        <p>
          You can open a fake splash screen that won't go away, with its developer tools. You can also manipulate
          its state to your likings to theme all parts of it without any trouble.
        </p>
        <Button>Open Splash Screen</Button>
      </div>
    );
  }
}

module.exports = powercord.api.settings.connectStores('pc-general')(Settings);
