const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip, Clickable, Icon, HeaderBar, AsyncComponent, Icons: { Server } } = require('powercord/components');

const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));
const SearchBox = AsyncComponent.from((async () => {
  const { searchHelpTextVisible } = await getModule([ 'searchHelpTextVisible' ]);
  const GuildDiscoverySearch = await getModuleByDisplayName('GuildDiscoverySearch');
  const instance = new GuildDiscoverySearch({});
  return (props) => {
    const res = instance.renderSearch().props.children({});
    res.props.className += ' powercord-store-search';
    [ res.props.children.props.children ] = res.props.children.props.children;
    Object.assign(res.props.children.props.children.props.children[0].props, props);
    if (props.focused) {
      res.props.children.props.children.props.children[1].props.className += ` ${searchHelpTextVisible}`;
    }
    return res;
  };
})());

let classes = null;
setImmediate(async () => {
  classes = {
    backgroundFill: (await getModule([ 'backgroundFill' ])).backgroundFill,
    headerBar: await getModule([ 'iconWrapper', 'clickable' ]),
    store: await getModule([ 'storeHomeWidth', 'container' ])
  };
});

module.exports = (type) =>
  class Store extends React.Component {
    constructor (props) {
      super(props);
      const words = [ 'spicy', 'epic', 'awesome', 'caffeine-powered', 'useful', 'cool', 'cute' ];
      this.state = {
        search: '',
        focused: false,
        word: words[Math.floor(Math.random() * words.length)]
      };
    }

    doSearch () {
      const input = document.querySelector('.powercord-store-search input');
      if (input) {
        input.blur();
      }
      console.log(this.state.search);
    }

    render () {
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
      const { headerBar, store } = classes;
      return <div className='powercord-text powercord-store'>
        <HeaderBar transparent={false} toolbar={this.renderToolbar()}>
          <Clickable
            className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}
            onClick={async () => {
              const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
              settingsModule.open(`pc-moduleManager-${type}`);
              setTimeout(() => history.back(), 350);
            }}
          >
            <Tooltip text='Go back to Settings' position='bottom'>
              <Icon name='ArrowLeft' className={headerBar.icon}/>
            </Tooltip>
          </Clickable>
          <HeaderBar.Title>Browse {type[0].toUpperCase() + type.slice(1)}</HeaderBar.Title>
        </HeaderBar>
        <VerticalScroller outerClassName={[ store.container, 'powercord-store-container' ].join(' ')}>
          {/* @todo: fucking light theme support because APPARENTLY that still a thing... */}
          <img className={classes.backgroundFill} alt='background' src='/assets/c486dc65ce2877eeb18e4c39bb49507a.svg'/>
          <SearchBox
            placeholder={`Search for ${this.state.word} ${type}...`}
            searchTerm={this.state.search}
            focused={this.state.focused}
            onFocus={() => this.setState({ focused: true })}
            onBlur={() => this.setState({ focused: false })}
            onChange={search => this.setState({ search })}
            onKeyPress={e => e.charCode === 13 && this.doSearch()}
          />
          {/* Object.values(Icon.Names).map(name => <Icon name={name}/>) */}
        </VerticalScroller>
      </div>;
    }

    renderToolbar () {
      const { headerBar } = classes;
      return <>
        <Tooltip text='Publish' position='bottom'>
          <Clickable className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
            <Icon className={headerBar.icon} name='CloudUpload'/>
          </Clickable>
        </Tooltip>
        {type === 'plugins' && <Tooltip text='Hosting' position='bottom'>
          <Clickable className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
            <Server className={headerBar.icon}/>
          </Clickable>
        </Tooltip>}
      </>;
    }
  };
