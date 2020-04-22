const { React, Flux, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip, Clickable, HeaderBar, AsyncComponent, Icons: { Plugin: PluginIcon, Theme, CloudUpload, Certificate, Server } } = require('powercord/components');

const Product = require('../brrrrr/items/Products/Product');
const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));
const SearchBox = AsyncComponent.from((async () => {
  const { searchHelpTextVisible } = await getModule([ 'searchHelpTextVisible' ]);
  const GuildDiscoverySearch = await getModuleByDisplayName('GuildDiscoverySearchWithResults');
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
    background: (await getModule([ 'bg', 'body' ])).bg,
    quickSelectArrow: (await getModule([ 'quickSelectArrow' ])).quickSelectArrow,
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
        <div className={headerBar.iconWrapper}>
          {this.state.type === 'plugins'
            ? <PluginIcon className={headerBar.icon} width={24} height={24}/>
            : <Theme className={headerBar.icon} width={24} height={24}/>}
        </div>
        <HeaderBar.Title>Browse {this.state.type[0].toUpperCase() + this.state.type.slice(1)}</HeaderBar.Title>
      </HeaderBar>
      <img className={classes.background} alt='background' src={this.props.images.background}/>
      <VerticalScroller outerClassName={[ store.container, 'powercord-store-container' ].join(' ')}>
        <div className='powercord-store-body'>
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
          <CloudUpload className={headerBar.icon}/>
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
          <div className={classes.quickSelectArrow}/>
        </div>
        <div className='filter'>
          <div className='label'>Type:</div>
          <div className='value'>Cute</div>
          <div className={classes.quickSelectArrow}/>
        </div>
        <div className='filter'>
          <div className='label'>Sort by:</div>
          <div className='value'>Newest</div>
          <div className={classes.quickSelectArrow}/>
        </div>
      </div>
    </>;
  }

  renderList () {
    const entityManager = powercord[this.state.type === 'plugins' ? 'pluginManager' : 'styleManager'];
    // @todo: do it but it's not shit and uses new manifest format
    return <>
      <div className={[ 'powercord-store-products', this.state.focused ? 'faded' : '' ].join(' ')}>
        {[ ...entityManager[this.state.type].values() ].map(entity => <Product product={entity} type={this.state.type}/>)}
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
