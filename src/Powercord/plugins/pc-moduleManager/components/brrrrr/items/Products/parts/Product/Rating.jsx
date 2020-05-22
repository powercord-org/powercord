const { React } = require('powercord/webpack');
const { Tooltip, Clickable, FormTitle, Icons: { ThumbsUp, ThumbsDown } } = require('powercord/components');

module.exports = ({ up, down, self, onVote }) =>
  <div className='powercord-product-rating'>
    <FormTitle>Rating</FormTitle>
    <div className='voting'>
      <Tooltip delay={1000} text='Upvote' position='top'>
        <Clickable onClick={() => onVote(1)} className='upvote'>
          <ThumbsUp width={18} height={18}/>
          <span className={[ 'count', self === 1 ? 'self' : '' ].join(' ')}>{up}</span>
        </Clickable>
      </Tooltip>
      <span className='separator'/>
      <Tooltip delay={1000} text='Downvote' position='top'>
        <Clickable onClick={() => onVote(0)} className='downvote'>
          <ThumbsDown width={18} height={18}/>
          <span className={[ 'count', self === 0 ? 'self' : '' ].join(' ')}>{down}</span>
        </Clickable>
      </Tooltip>
    </div>
  </div>;
