const { React } = require('powercord/webpack');
const { Tooltip, FormTitle, Icons: { ThumbsUp, ThumbsDown } } = require('powercord/components');

module.exports = ({ rating }) =>
  <div className='powercord-store-product-rating'>
    <FormTitle>Rating</FormTitle>
    <div className='item'>
      <Tooltip text='Positive (+1)' position='top'>
        <div className='positive'>
          <ThumbsUp/>
          <span className='positive-count'>{rating[0]}</span>
        </div>
      </Tooltip>
      <Tooltip text='Negative (-1)' position='top'>
        <div className='negative'>
          <ThumbsDown/>
          <span className='negative-count'>{rating[1]}</span>
        </div>
      </Tooltip>
    </div>
  </div>;
