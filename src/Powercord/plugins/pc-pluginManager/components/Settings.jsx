const { React } = require('powercord/webpack');
const { spawn } = require('child_process');

const Installed = require('./Installed');
const Explore = require('./Explore');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      explore: false
    };

    this.openFolder = (dir) => {
      const cmds = {
        win32: 'explorer',
        darwin: 'open',
        linux: 'xdg-open'
      };
      spawn(cmds[process.platform], [ dir ]);
    };
  }

  render () {
    if (this.state.explore) {
      return <Explore openFolder={this.openFolder} goToInstalled={() => this.setState({ explore: false })}/>;
    }
    return <Installed openFolder={this.openFolder} goToExplore={() => this.setState({ explore: true })}/>;
  }
};
