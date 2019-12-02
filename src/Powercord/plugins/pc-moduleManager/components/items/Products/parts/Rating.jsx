const { React } = require('powercord/webpack');
const { Tooltip, FormTitle, Icons: { FontAwesome } } = require('powercord/components');

module.exports = ({ rating }) =>
  <div className='powercord-store-product-rating'>
    <FormTitle>Rating</FormTitle>
    <div className='item'>
      <Tooltip text='Positive (+1)' position='top'>
        <div className='positive'>
          <FontAwesome icon='thumbs-up'/>
          <span className='positive-count'>{rating[0]}</span>
        </div>
      </Tooltip>
      <Tooltip text='Negative (-1)' position='top'>
        <div className='negative'>
          <FontAwesome icon='thumbs-down fa-flip-horizontal'/>
          <span className='negative-count'>{rating[1]}</span>
        </div>
      </Tooltip>
    </div>
  </div>;
