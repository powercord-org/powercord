const { React } = require('powercord/webpack');
const { Icon, Icons: { FontAwesome, GitHub } } = require('powercord/components');

module.exports = () =>
  <div className='powercord-store-product-footer'>
    <div className='item'>
      <div className='actions-group-1'>
        <GitHub/>
        <FontAwesome icon='cog'/>
      </div>
      <div className='actions-group-2'>
        <span className='review' style={{ color: '#ffd74b' }}>
          <FontAwesome icon='comment-alt-edit'/>
        </span>
        <span className='download' style={{ color: '#43b581' }}>
          <Icon name='CloudDownload'/>
        </span>
        <span className='report' style={{ color: '#f04747' }}>
          <Icon name='Flag'/>
        </span>
      </div>
    </div>
  </div>;
