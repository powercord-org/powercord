const { React } = require('powercord/webpack');
const { FormTitle } = require('powercord/components');

module.exports = ({ tags, nsfw }) =>
  <div className='powercord-store-product-tags'>
    <FormTitle>Tags</FormTitle>
    <div className='item'>
      {nsfw ? <div className='tag nsfw'>NSFW</div> : ''}
      {tags.map(tag => <div className='tag'>{tag}</div>)}
    </div>
  </div>;
