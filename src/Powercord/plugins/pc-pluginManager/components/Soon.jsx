const { React } = require('powercord/webpack');

module.exports = class Soon extends React.Component {
  render () {
    return <div className='powercord-plugin-soon powercord-text'>
      <img src='/assets/8c998f8fb62016fcfb4901e424ff378b.svg' alt='wumpus'/>
      <p>Plugin Manager is currently being re-done.</p>
      <p>It'll be done AND WORKING before 2021, I promise.</p>
    </div>;
  }
};
