const { React } = require('powercord/webpack');
const { Tooltip, FormTitle, Icons: { ThumbsUp, ThumbsDown } } = require('powercord/components');

module.exports = ({ votes }) =>
  <div className='powercord-store-product-rating'>
    <FormTitle>Rating</FormTitle>
    <div className='item'>
      <Tooltip text='Vote +1' position='top'>
        <div className='vote-up'>
          <ThumbsUp/>
          <span className='count'>{votes.up}</span>
        </div>
      </Tooltip>
      <Tooltip text='Vote -1' position='top'>
        <div className='vote-down'>
          <ThumbsDown/>
          <span className='count'>{votes.down}</span>
        </div>
      </Tooltip>
    </div>
  </div>;
