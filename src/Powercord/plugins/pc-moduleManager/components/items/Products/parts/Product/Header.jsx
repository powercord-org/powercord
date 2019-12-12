const { React } = require('powercord/webpack');
const { Tooltip, Icons: { Verified } } = require('powercord/components');

module.exports = ({ name, verified, nsfw }) =>
  <div className='powercord-product-header'>
    {verified && <Tooltip text='Verified' position='top'>
      <Verified width={18} height={18}/>
    </Tooltip>}
    <span className='name'>{name}</span>
    {!nsfw && <span className='kinky'>NSFW</span>}
  </div>;
