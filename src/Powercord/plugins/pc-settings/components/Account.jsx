const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack'); // eslint-disable-line no-unused-vars

module.exports = (props) => {
  const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');

  return <div className='powercord-account-list-account'>
    <img src={`${baseUrl}/assets/${props.type}.png`} alt={props.type}/>
    <span className='powercord-account-item'>
      {powercord.account[props.type]
        ? powercord.account[props.type].name
        : <a href='#' onClick={() => openExternal(`${baseUrl}/oauth/${props.type}`)}>Link it now</a>}
    </span>
  </div>;
};
