const Plugin = require('powercord/Plugin');
const { getOwnerInstance, waitFor, sleep } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, constants } = require('powercord/webpack');

const webContents = require('electron').remote.getCurrentWindow();

module.exports = class TitleBarGames extends Plugin {
  async start () {
    this.applications = await getModule([ 'LAUNCHABLE_APPLICATIONS' ]);
    this.navigator = await getModule([ 'transitionTo' ]);
    this.patchTitlebar();
  }

  launchApplication ({ id }) {
    return webContents.send('DISCORD_LAUNCH_APPLICATION', id);
  }

  getApplications () {
    const applications = this.applications
      .LAUNCHABLE_APPLICATIONS()
      .map(({ application }) =>
        React.createElement('div', {
          className: 'pc-game-img',
          onClick: () => this.launchApplication(application),
          style: {
            backgroundImage: `url(https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}.webp?size=256&keep_aspect_ratio=false)`
          }
        })
      );

      applications.push(React.createElement('div', {
        className: 'pc-game-img fas fa-gamepad',
        onClick: () => this.navigator.transitionTo('/library')
      }));

      return applications;
  }

  async patchTitlebar () {
    const _this = this;

    const titleBar = await waitFor('.pc-titleBar');
    const instance = getOwnerInstance(titleBar);

    const DirectTitleBarComponent = instance._reactInternalFiber.child.child.type;
    const TitleBarComponent = class PatchedTitleBarComponent extends React.Component {
      render () {
        const directTitleBar = new DirectTitleBarComponent();

        directTitleBar.props.children.splice(1, 0,
          React.createElement('div', {
            className: 'pc-games-bar'
          }, ..._this.getApplications())
        );

        return directTitleBar;
      }
    };

    inject('pc-titleBarGames', instance.__proto__, 'render', () =>
      React.createElement(TitleBarComponent)
    );

    // re-render titlebar after discord updates with games
    // @todo automatic
    await sleep(5000);
    instance.forceUpdate();
  }

  unload () {
    uninject('pc-titleBarGames');
  }
};
