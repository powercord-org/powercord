const { React, getModule } = require('powercord/webpack');
const { Clickable } = require('powercord/components');

let classesCache = null;

class Announcement extends React.PureComponent {
  constructor () {
    super();

    this.state = classesCache || {
      types: {},
      button: '',
      dismiss: ''
    };
  }

  async componentDidMount () {
    if (!classesCache) {
      const classes = await getModule([ 'colorPremiumTier1' ]);
      classesCache = {
        types: {
          blurple: classes.colorBrand,
          red: classes.colorDanger,
          orange: classes.colorDefault,
          blue: classes.colorInfo,
          dark: classes.colorDark,
          blurple_gradient: classes.colorPremiumTier1,
          spotify: classes.colorSpotify,
          purple: classes.colorStreamerMode,
          green: classes.colorSuccess
        },
        button: classes.button,
        dismiss: classes.closeButton,
        notice: classes.notice
      };

      this.setState(classesCache);
    }
  }

  render () {
    const { types, button, dismiss, notice } = this.state;

    return <div className={`powercord-notice ${notice} ${(types[this.props.color] || types.blurple)}`} id={this.props.id}>
      {this.props.message}
      <Clickable className={dismiss} onClick={() => this.handleClick(this.props.onClose)}/>
      {this.props.button && <button className={button} onClick={() => this.handleClick(this.props.button.onClick)}>
        {this.props.button.text}
      </button>}
    </div>;
  }

  handleClick (func) {
    powercord.api.notices.closeAnnouncement(this.props.id);
    if (func && typeof func === 'function') {
      func();
    }
  }
}

module.exports = Announcement;
