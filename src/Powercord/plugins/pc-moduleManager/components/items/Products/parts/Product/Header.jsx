const { React } = require('powercord/webpack');
const { Tooltip, Icons: { Verified } } = require('powercord/components');

module.exports = ({ name, description, verified }) =>
  <div className='powercord-store-product-info'>
    <div className='title'>
      {verified && <Tooltip text='Verified' position='top'>
        <div className='verifiedIcon'>
          <Verified/>
        </div>
      </Tooltip>}
      <span className='name'>{name}</span>
    </div>
    <span className='description'>{description}</span>
  </div>;
