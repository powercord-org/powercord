const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');

const Clickable = getModuleByDisplayName('Clickable');

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
      Promise.all([ classes ])
        .then(value => {
          this.setState({
            types: {
              blurple: value[0].noticeBrand,
              red: value[0].noticeDanger,
              orange: value[0].noticeDefault,
              facebook: value[0].noticeFacebook,
              blue: value[0].noticeInfo,
              dark: value[0].noticePremium,
              blurple_gradient: value[0].noticePremiumGrandfathered,
              spotify: value[0].noticeSpotify,
              purple: value[0].noticeStreamerMode,
              green: value[0].noticeSuccess,
              survey: value[0].noticeSurvey
            },
            button: value[0].button,
            dismiss: value[0].dismiss
          });
          classesStore = this.state;
        });
    }
  }

  render () {
    const { notice, onClose } = this.props;
    const { types, button, dismiss } = this.state;

    return <div className={`powercord-notice ${(types[notice.type.toLowerCase()] || types.blurple)}`}>
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
