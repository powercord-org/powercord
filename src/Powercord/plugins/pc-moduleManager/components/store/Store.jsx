const { React, Flux, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip, Clickable, Icon, HeaderBar, AsyncComponent, Icons: { Plugin: PluginIcon, Theme, Certificate, Server } } = require('powercord/components');

const Product = require('../items/Products/Product');
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
    if (props.focused && props.searchTerm.length > 0) {
      res.props.children.props.children.props.children[1].props.className += ` ${searchHelpTextVisible}`;
    }
    return res;
  };
})());

let classes = null;
setImmediate(async () => {
  classes = {
    body: (await getModule([ 'searchHelpTextVisible' ])).body,
    backgroundFill: (await getModule([ 'backgroundFill' ])).backgroundFill,
    topic: (await getModule([ 'topic', 'expandable' ])).topic,
    headerBar: await getModule([ 'iconWrapper', 'clickable' ]),
    store: await getModule([ 'storeHomeWidth', 'container' ])
  };
});

class Store extends React.Component {
  constructor (props) {
    super(props);
    const words = [ 'spicy', 'epic', 'awesome', 'caffeine-powered', 'useful', 'cool', 'cute' ];
    this.state = {
      search: '',
      focused: false,
      word: words[Math.floor(Math.random() * words.length)],
      type: location.href.split('/').pop()
    };
  }

  doSearch () {
    const input = document.querySelector('.powercord-store-search input');
    if (input) {
      input.blur();
    }
    console.log(this.state.search);
  }

  clearSearch () {
    const input = document.querySelector('.powercord-store-search input');
    if (input) {
      input.blur();
    }

    this.setState({
      search: '',
      focused: false
    });
  }

  render () {
    // dont touch mah stuff :angery:
    const ids = [ 'h6DNdop6pD8', 'd1YBv2mWll0', 'dQw4w9WgXcQ', 'A963X1RaRfk', 'q4OItmKWFKw', 'NHEaYbDWyQE' ];
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%'
    }}>
      <iframe
        width='100%' height='100%'
        src={`https://www.youtube.com/embed/${ids[Math.floor(Math.random() * ids.length)]}`}
        frameBorder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen/>
    </div>;

    /* eslint-disable no-unreachable */
    // noinspection UnreachableCodeJS
    const { headerBar, store } = classes;
    return <div className='powercord-text powercord-store'>
      <HeaderBar transparent={false} toolbar={this.renderToolbar()}>
        <div className={headerBar.iconWrapper} style={{ width: '24px' }}>
          {this.state.type === 'plugins' ? <PluginIcon/> : <Theme/>}
        </div>
        <HeaderBar.Title>Browse {this.state.type[0].toUpperCase() + this.state.type.slice(1)}</HeaderBar.Title>
      </HeaderBar>
      <img className={classes.backgroundFill} alt='background' src={this.props.images.background}/>
      <VerticalScroller outerClassName={[ store.container, 'powercord-store-container' ].join(' ')}>
        <div className={[ classes.body, 'powercord-store-body' ].join(' ')}>
          <SearchBox
            placeholder={`Search for ${this.state.word} ${this.state.type}...`}
            searchTerm={this.state.search}
            focused={this.state.focused}
            onFocus={() => this.setState({ focused: true })}
            onBlur={() => this.setState({ focused: false })}
            onChange={search => this.setState({ search })}
            onClear={() => this.clearSearch()}
            onKeyPress={e => e.charCode === 13 && this.doSearch()}
            autoFocus={false}
          />
          {this.renderFilters()}
          {this.renderList()}
        </div>
      </VerticalScroller>
    </div>;
  }

  renderToolbar () {
    const { topic, headerBar } = classes;
    /*
     * if (!powercord.account) {
     *  return null;
     * }
     */

    return <>
      <div className={topic}>Get in touch:</div>
      <Tooltip text={`Publish a ${this.state.type.slice(0, -1)}`} position='bottom'>
        <Clickable className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
          <Icon className={headerBar.icon} name='CloudUpload'/>
        </Clickable>
      </Tooltip>
      <Tooltip text='Verification' position='bottom'>
        <Clickable className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
          <Certificate className={headerBar.icon}/>
        </Clickable>
      </Tooltip>
      {this.state.type === 'plugins' && <Tooltip text='Hosting' position='bottom'>
        <Clickable className={[ headerBar.iconWrapper, headerBar.clickable ].join(' ')}>
          <Server className={headerBar.icon}/>
        </Clickable>
      </Tooltip>}
    </>;
  }

  renderFilters () {
    return <>
      <div className='powercord-store-filters'>
        <div className='filter'>
          <div className='label'>Browsing:</div>
          <div className='value'>All {this.state.type}</div>
        </div>
        <div className='filter'>
          <div className='label'>Type:</div>
          <div className='value'>Cute</div>
        </div>
        <div className='filter'>
          <div className='label'>Sort by:</div>
          <div className='value'>Newest</div>
        </div>
      </div>
    </>;
  }

  renderList () {
    const entityManager = powercord[this.state.type === 'plugins' ? 'pluginManager' : 'styleManager'];
    return <>
      <div className='powercord-store-list'>
        {[ ...entityManager[this.state.type].values() ]
          .filter(entity =>
            this.state.search !== ''
              ? entity.manifest.name.toLowerCase().includes(this.state.search.toLowerCase())
              : entity)
          .map(entity =>
            <Product
              product={entity}
              className='powercord-store-product'
              previews={[ 'https://www.figma.com/file/WFNUFYEVYMTZf5YHDvFLdI/image/a85019acab20c35fb137fe590dd619fc89004280' ]}
              type={this.state.type}
            />
          )
        }
      </div>
    </>;
  }
}

const images = {
  dark: {
    background: '/assets/c486dc65ce2877eeb18e4c39bb49507a.svg'
  },
  light: {
    background: '/assets/8c1fd3ecbbf620ec49cecda2aa53f256.svg'
  }
};

module.exports = Flux.connectStoresAsync([ getModule([ 'theme' ]) ], ([ settingsStore ]) => ({ images: images[settingsStore.theme] }))(Store);
