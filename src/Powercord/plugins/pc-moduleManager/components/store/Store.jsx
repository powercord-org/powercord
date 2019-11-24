const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip, Clickable, Icon, HeaderBar, AsyncComponent, Icons: { Server } } = require('powercord/components');

const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));

let cache = null;
module.exports = (type) =>
  class Store extends React.Component {
    constructor (props) {
      super(props);
      this.state = {
        search: '',
        classes: cache
      };
    }

    async componentDidMount () {
      if (this.state.classes === null) {
        cache = {
          headerBar: await getModule([ 'iconWrapper', 'clickable' ]),
          store: await getModule([ 'storeHomeWidth', 'container' ])
        };

        this.setState({ classes: cache });
      }
    }

    render () {
      if (this.state.classes === null) {
        return null;
      }

      const ids = [ 'h6DNdop6pD8', 'd1YBv2mWll0', 'dQw4w9WgXcQ', 'A963X1RaRfk', 'q4OItmKWFKw', 'NHEaYbDWyQE' ];
      return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <iframe
          width="100%" height="100%"
          src={`https://www.youtube.com/embed/${ids[Math.floor(Math.random() * ids.length)]}`}
          frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen/>
      </div>;

      /* eslint-disable no-unreachable */
      // noinspection UnreachableCodeJS
      const { headerBar, store } = this.state.classes;
      return <div className='powercord-text powercord-store'>
        <HeaderBar transparent={false} toolbar={this.renderToolbar()}>
          <Clickable
            className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}
            onClick={() => console.log('back')}
          >
            <Icon name='ArrowLeft' className={headerBar.icon}/>
          </Clickable>
          <HeaderBar.Title>Browse {type[0].toUpperCase() + type.slice(1)}</HeaderBar.Title>
        </HeaderBar>
        <VerticalScroller outerClassName={store.container}>
          {/* Object.values(Icon.Names).map(name => <Icon name={name}/>) */}
        </VerticalScroller>
      </div>;
    }

    renderToolbar () {
      const { headerBar } = this.state.classes;
      return <>
        <Tooltip text='Publish' position='bottom'>
          <div className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
            <Icon className={headerBar.icon} name='CloudUpload'/>
          </div>
        </Tooltip>
        {type === 'plugin' && <Tooltip text='Hosting' position='bottom'>
          <div className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
            <Server className={headerBar.icon}/>
          </div>
        </Tooltip>}
      </>;
    }
  };
