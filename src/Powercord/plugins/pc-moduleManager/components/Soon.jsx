const { React, i18n: { Messages } } = require('powercord/webpack');

module.exports = class Soon extends React.PureComponent {
  render () {
    return <div className='powercord-plugin-soon powercord-text'>
      <div className='wumpus'>
        <img src='/assets/8c998f8fb62016fcfb4901e424ff378b.svg' alt='wumpus'/>
      </div>
      <p>{Messages.POWERCORD_THEMES_WIP1}</p>
      <p>{Messages.POWERCORD_THEMES_WIP2}</p>
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
