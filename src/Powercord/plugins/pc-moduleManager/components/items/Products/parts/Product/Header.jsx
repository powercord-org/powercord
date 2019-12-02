const { React } = require('powercord/webpack');

module.exports = ({ name, description }) =>
  <div className='powercord-store-product-info'>
    <div className='title'>
      <span className='name'>{name}</span>
    </div>
    <span className='description'>{description}</span>
  </div>;
