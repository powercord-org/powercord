const { React } = require('powercord/webpack');
const { readdirSync } = require('fs');

const Header = require('./Header');
const Plugins = require('./Plugins');

const things = {
  plugins: {
    folder: powercord.pluginManager.pluginDir,
    component: Plugins
  },
  themes: {
    folder: powercord.styleManager.themesDir,
    component: () => null
  }
};

module.exports = (type, experimental) =>
  class Layout extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        search: '',
        fetching: false
      };

      this.openFolder = () => DiscordNative.fileManager.showItemInFolder(`${things[type].folder}/.`);
      this.fetchEntities = async () => {
        this.setState({ fetching: true });

        powercord.api.notices.closeToast('missing-entities-notify');

        const entityManager = powercord[type === 'plugins' ? 'pluginManager' : 'styleManager'];
        const missingEntities = [];

        let invalidEntity;

        readdirSync(things[type].folder).forEach(filename => {
          if (!entityManager.isInstalled(filename)) {
            try {
              entityManager.mount(filename);

              if (type === 'plugins') {
                entityManager.load(filename);
              } else {
                entityManager.enable(filename);
              }

              missingEntities.push(filename);
            } catch (e) {
              invalidEntity = filename;
            }
          }
        });

        const entity = missingEntities.length === 1 ? type.slice(0, -1) : type;
        const subjectiveEntity = `${entity} ${entity === type ? 'were' : 'was'}`;
        const notifyResult = () => {
          this.setState({ fetching: false });

          if (missingEntities.length > 0 || invalidEntity) {
            /* eslint-disable multiline-ternary */
            powercord.api.notices.sendToast('missing-entities-notify', {
              header: invalidEntity
                ? `An invalid ${type.slice(0, -1)} was found - check console for errors!`
                : `Found ${missingEntities.length} missing ${entity}!`,
              content: <div dangerouslySetInnerHTML={{ __html:
                `${invalidEntity ? `Refetch was stopped as '${invalidEntity}' has failed to meet a valid configuration.
                ${missingEntities.length > 0 ? '<br/><br/>' : ''}` : ''}

                ${missingEntities.length > 0 ? `The following ${subjectiveEntity} retrieved
                ${invalidEntity ? ' prior to receiving this error' : ''}:
                <ul>
                  ${missingEntities.map(entity => `<li key=${entity}>&ndash; ${entity}</li>`).join('')}
                </ul>` : ''}`
              }}>
              </div>,
              buttons: [ {
                text: 'OK',
                color: 'green',
                look: 'outlined'
              } ],
              type: invalidEntity ? 'danger' : 'success'
            });
          } else {
            powercord.api.notices.sendToast('missing-entities-notify', {
              header: `No missing ${type} were found - try again later!`,
              type: 'danger',
              timeout: 10e3
            });
          }
        };

        setTimeout(notifyResult, 600);
      };
    }

    render () {
      const Component = things[type].component;
      return <div className='powercord-entities-manage powercord-text'>
        <Header
          type={type} experimental={experimental} search={this.state.search}
          onSearch={search => this.setState({ search })} onOpenFolder={this.openFolder}
          onFetch={this.fetchEntities} fetching={this.state.fetching}
        />
        <Component search={this.state.search}/>
      </div>;
    }
  };
