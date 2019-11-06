const { React } = require('powercord/webpack');
const Announcement = require('./Announcement');

class AnnouncementContainer extends React.PureComponent {
  constructor (props) {
    super(props);

    this._handler = () => this.forceUpdate();
  }

  componentDidMount () {
    powercord.api.notices.on('announcementAdded', this._handler);
    powercord.api.notices.on('announcementClosed', this._handler);
  }

  componentWillUnmount () {
    powercord.api.notices.off('announcementAdded', this._handler);
    powercord.api.notices.off('announcementClosed', this._handler);
  }

  render () {
    const aId = Object.keys(powercord.api.notices.announcements).pop();
    return aId
      ? <Announcement id={aId} {...powercord.api.notices.announcements[aId]}/>
      : null;
  }
}

module.exports = AnnouncementContainer;
