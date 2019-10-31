const { React } = require('powercord/webpack');
const { spawn } = require('child_process');

module.exports = class Soon extends React.Component {
  render () {
    return <div className='powercord-plugin-soon powercord-text'>
      <img src='/assets/8c998f8fb62016fcfb4901e424ff378b.svg' alt='wumpus'/>
      <p>Plugin Manager is currently being re-done.</p>
      <p>It'll be done AND WORKING before 2021, I promise.</p>
      <div>
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            this.openFolder(powercord.pluginManager.pluginDir);
          }}
        >Open Plugins Folder</a>
        <a
          href='#'
          onClick={e => {
            e.preventDefault();
            this.openFolder(powercord.styleManager.themesDir);
          }}
        >Open Themes Folder</a>
      </div>
      <div>
        <a href='https://epic.weeb.services/2db734db2b.png' target='_blank'>Marvin did this :eyes:</a>
      </div>
    </div>;
  }

  openFolder (dir) {
    const cmds = {
      win32: 'explorer',
      darwin: 'open',
      linux: 'xdg-open'
    };
    spawn(cmds[process.platform], [ dir ]);
  }
};
