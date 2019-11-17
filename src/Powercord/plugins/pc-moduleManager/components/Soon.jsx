const { React } = require('powercord/webpack');

module.exports = class Soon extends React.Component {
  render () {
    return <div className='powercord-plugin-soon powercord-text'>
      <div className='wumpus'>
        <img src='/assets/8c998f8fb62016fcfb4901e424ff378b.svg' alt='wumpus'/>
      </div>
      <p>This part of Powercord is not done yet.</p>
      <p>We're working on it and will release it before 2021.</p>
      <div>
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            DiscordNative.fileManager.showItemInFolder(`${powercord.styleManager.themesDir}/.`);
          }}
        >Open Themes Folder</a>
      </div>
    </div>;
  }
};
