const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');

const Clickable = getModuleByDisplayName('Clickable');
const classes = getModule([ 'noticeBrand' ]);

const Notice = class Notice extends React.Component {
  render () {
    const { notice, onClose } = this.props;

    return <div className={`powercord-notice ${(Notice.TYPES[notice.type] || Notice.TYPES.BLURPLE)}`}>
      {notice.message}
      <Clickable className={classes.dismiss} onClick={() => onClose()}/>
      {notice.button &&
      <button className={classes.button} onClick={notice.button.onClick}>{notice.button.text}</button>}
    </div>;
  }
};

Notice.TYPES = {
  BLURPLE: classes.noticeBrand,
  RED: classes.noticeDanger,
  ORANGE: classes.noticeDefault,
  FACEBOOK: classes.noticeFacebook,
  BLUE: classes.noticeInfo,
  DARK: classes.noticePremium,
  BLURPLE_GRADIENT: classes.noticePremiumGrandfathered,
  SPOTIFY: classes.noticeSpotify,
  PURPLE: classes.noticeStreamerMode,
  GREEN: classes.noticeSuccess
};

module.exports = Notice;
