const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

const Clickable = AsyncComponent.from(getModuleByDisplayName('Clickable'));
let classesStore = null;

const Notice = class Notice extends React.Component {
  constructor () {
    super();

    this.state = classesStore || {
      types: [],
      button: '',
      dismiss: ''
    };
  }

  async componentDidMount () {
    if (!classesStore) {
      const classes = await getModule([ 'noticeBrand' ]);
      this.setState({
        types: {
          BLURPLE: classes.noticeBrand,
          RED: classes.noticeDanger,
          ORANGE: classes.noticeDefault,
          FACEBOOK: classes.noticeFacebook,
          BLUE: classes.noticeInfo,
          DARK: classes.noticePremium,
          BLURPLE_GRADIENT: classes.noticePremiumGrandfathered,
          SPOTIFY: classes.noticeSpotify,
          PURPLE: classes.noticeStreamerMode,
          GREEN: classes.noticeSuccess,
          SURVEY: classes.noticeSurvey
        },
        button: classes.button,
        dismiss: classes.dismiss
      });
      classesStore = this.state;
    }
  }

  render () {
    const { notice, onClose } = this.props;
    const { types, button, dismiss } = this.state;

    return <div className={`powercord-notice ${(types[notice.type] || types.BLURPLE)}`}>
      {notice.message}
      <Clickable className={dismiss} onClick={() => onClose()}/>
      {notice.button &&
      <button className={button} onClick={notice.button.onClick}>{notice.button.text}</button>}
    </div>;
  }
};

Notice.TYPES = {
  BLURPLE: 'BLURPLE',
  RED: 'RED',
  ORANGE: 'ORANGE',
  FACEBOOK: 'FACEBOOK',
  BLUE: 'BLUE',
  DARK: 'DARK',
  BLURPLE_GRADIENT: 'BLURPLE_GRADIENT',
  SPOTIFY: 'SPOTIFY',
  PURPLE: 'PURPLE',
  GREEN: 'GREEN',
  SURVEY: 'SURVEY' // noticeInfo's (Notice.TYPES.BLUE) evil twin -- hovering over the CTA button greets you with some gloomy black text instead of the traditional white.
};

module.exports = Notice;
