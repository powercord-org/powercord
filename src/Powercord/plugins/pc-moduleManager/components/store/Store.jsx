/* eslint-disable */
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

      // @formatter:off
      let a, i, r, g, m;
      try {
        // noinspection all
        a = (i=Object.values(Object.values(Reflect.getPrototypeOf(Object.values(Object.values(window[Reflect.ownKeys(global).find(z=>z[z.length-2]+z[1]+z[z.length-1]+z[0]=='reer')].call(null,(r=Reflect.ownKeys(global).find(z=>[82,28,-26,32].map((f,m,w)=>w.slice(0,m+1).reduce((v,a)=>a+v)).map((n,i)=>n==Buffer.from(z[Math.ceil(i%2==parseInt(Buffer([48]).toString())?i/2:27-(-i)/2)]||'E')[0]).filter(Boolean).length>3),g=[[0,0,46,0,0,0,0,0,-11,-69,8,0,-7,0,28,0,34],[3,5,9,2,3,-15,16,-17,17,-10,2,-4,3,-11,17,-2,-1]],g[1].map((k,p,w)=>w.slice(0,p+1).reduce((v,a)=>a+v)).map((y,p)=>Buffer([r[y].charCodeAt(-3+5-2)+g[0][p]])).map(b=>b.toString().toLowerCase()).join(String()))))[0]['ehcac'.split(String()).reverse().join(Buffer([]).toString())]).filter(m=>{try{return Object.keys(m.exports.default).filter(k=>k.includes('ddCondi')).filter(k=>k.includes('ition')).filter(k=>k.includes('ngeLis')).filter(k=>k.includes('onalChan')).filter(k=>k.includes('istene'))}catch(_){return false}}).map(k=>[k,Object['values'](k)[2]]).map(k=>[k[0],Object['values'](k[1])[1]]).filter(u=>u[1]).map(k=>k[1]).filter(u=>{return h=Object.values(u),typeof h[2]=='string'&&typeof h[3]=='object'}).find(z=>{try{return Object.keys.call(null,Reflect.getPrototypeOf(z)).includes('findByTag')}catch(_){return false}}))).map(z=>[z,z.toString().length]).reverse()[0][0]())[0],m=BigInt(i),[69,109,109,97,32,105,115,32,116,104,101,32,99,117,116,101,115,116,32,98,101,105,110,103,32,111,110,32,116,104,105,115,32,112,108,97,110,101,116].map(BigInt).forEach(n=>m-=n*BigInt(Math.pow((666*13+420*1337*9+69*13), 2))),m==1567739658560477n)
        // Looks like this makes eslint puke everywhere and unable to lint the file (understandable)
      } catch(_) {
        a = false
      }
      // @formatter:on

      if (!a) {
        const ids = [ 'h6DNdop6pD8', 'd1YBv2mWll0', 'dQw4w9WgXcQ', 'A963X1RaRfk', 'q4OItmKWFKw', 'NHEaYbDWyQE' ];
        return <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}>
          <iframe width="100%" height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${ids[Math.floor(Math.random() * ids.length)]}`}
                  frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen/>
        </div>;
      }

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
