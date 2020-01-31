const { React, i18n: { Messages } } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');

module.exports = (props) => {
  const baseUrl = powercord.settings.get('backendURL', WEBSITE);

  return <div className='powercord-account-list-account'>
    <img src={`${WEBSITE}/assets/${props.type}.png`} alt={props.type}/>
    <span className='powercord-account-item'>
      {powercord.account[props.type] ||
      <a href={`${baseUrl}/oauth/${props.type}`} target='_blank'>{Messages.POWERCORD_LINK_NOW}</a>}
    </span>
  </div>;
};
