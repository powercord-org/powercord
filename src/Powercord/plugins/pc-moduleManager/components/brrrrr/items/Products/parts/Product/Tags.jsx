const { React } = require('powercord/webpack');
const { FormTitle } = require('powercord/components');

module.exports = ({ tags }) =>
  <div className='powercord-product-tags'>
    <FormTitle>Tags</FormTitle>
    <div className='items'>
      {tags.map(tag => <div className='tag'>{tag}</div>)}
    </div>
  </div>;
