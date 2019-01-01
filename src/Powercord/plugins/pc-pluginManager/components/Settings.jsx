const { React } = require('powercord/webpack');

const Installed = require('./Installed');
const Explore = require('./Explore');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      explore: false
    };
  }

  render () {
    if (this.state.explore) {
      return <Explore goToInstalled={() => this.setState({ explore: false })}/>;
    }
    return <Installed goToExplore={() => this.setState({ explore: true })}/>;
  }
};
