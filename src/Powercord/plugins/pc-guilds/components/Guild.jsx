const { React, Flux, Router: { Link }, constants: { Routes }, contextMenu, getModuleByDisplayName, instance: { cache: moduleCache } } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');
const { Draggable } = window.ReactBeautifulDnd;

const Guild = class Guild extends React.PureComponent {
  constructor (props) {
    super(props);

    this.wrapperClass = Object.values(moduleCache).filter(m => m.exports && m.exports.wrapper && Object.keys(m.exports).length === 1)[2].exports.wrapper;
    this.guildClasses = Object.values(moduleCache).filter(m => m.exports && m.exports./* downloadAppButton */dragPlaceholder)[0].exports;
    this.iconClasses = Object.values(moduleCache).filter(m => m.exports && m.exports.iconActiveMini)[0].exports;

    this.state = {
      hovered: false
    };
  }

  get notifStyle () {
    const notifStyle = {
      opacity: 0.7,
      height: '0',
      transform: 'translate3d(0px, 0px, 0px)',
      transition: 'height 0.2s'
    };

    if (this.props.unread) {
      notifStyle.height = '8px';
    }

    if (this.props.selected) {
      notifStyle.height = '40px';
    }

    if (this.state.hovered) {
      notifStyle.height = '20px';
    }

    return notifStyle;
  }

  get guildClassName () {
    let className = this.guildClasses.container;
    // let className = this.guildClasses.guild;
    if (this.props.unread) {
      className += ` ${this.guildClasses.unread}`;
    }
    if (this.props.selected) {
      className += ` ${this.guildClasses.selected}`;
    }
    if (this.props.audio) {
      className += ` ${this.guildClasses.audio}`;
    }
    if (this.props.video) {
      className += ` ${this.guildClasses.video}`;
    }
    return className;
  }

  get iconClassName () {
    // let className = `${this.iconClasses.iconInactive} ${this.guildClasses.guildIcon}`;
    let className = `${this.iconClasses.icon} ${this.iconClasses.iconSizeLarge} ${this.iconClasses.iconInactive} ${this.guildClasses.guildIcon}`;
    if (!this.props.guild.icon) {
      className += ` ${this.iconClasses.noIcon}`;
    }
    return className;
  }

  render () {
    // eslint-disable-next-line new-cap
    const link = this.props.selectedChannelId ? Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId) : Routes.GUILD(this.props.guild.id);
    const maskID = Math.random().toString().slice(2); // kek

    return <Draggable draggableId={this.props.guild.id} index={this.props.index}>
      {(provided) => (
        <div
          onContextMenu={this.handleContextMenu.bind(this)}
          onMouseEnter={() => this.setState({ hovered: true })}
          onMouseLeave={() => this.setState({ hovered: false })}
          className={`listItem-2P_4kh pc-listItem`}
          ref={(r) => {
            provided.innerRef(r);
            this.props.setRef(r);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className='pill-31IEus pc-pill wrapper-sa6paO pc-wrapper'>
            <span className='item-2hkk8m pc-item' style={this.notifStyle}/>
          </div>
          <Tooltip text={this.props.guild.name} position='right'>
            <div className='blobContainer-239gwq pc-blobContainer'>
              <div className='wrapper-25eVIn'>
                <svg width='48' height='48' viewBox='0 0 48 48' className='svg-1X37T1 pc-svg'>
                  <mask id={maskID} fill='black' x='0' y='0' width='48' height='48'>
                    <path
                      d='M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z'
                      fill='white'/>
                    <rect
                      x='28' y='-4' width='24' height='24' rx='12' ry='12' transform='translate(20 -20)'
                      fill='black'/>
                    <rect
                      x='28' y='28' width='24' height='24' rx='12' ry='12' transform='translate(20 20)'
                      fill='black'/>
                  </mask>
                  <foreignObject mask={`url(#${maskID})`} x='0' y='0' width='48' height='48'>
                    <Link className='wrapper-1BJsBx' aria-label='aa' to={link}>
                      {this.props.guild.icon
                        ? <img
                          className='icon-27yU2q' alt='Server Icon' width='48' height='48'
                          src={`https://cdn.discordapp.com/icons/${this.props.guild.id}/${this.props.guild.icon}.png`
                        }/>
                        : <div className="acronym-2mOFsV pc-acronym" aria-label="Server Acronym">{this.props.guild.acronym}</div>}
                        </Link>
                      }
                  </foreignObject>
                </svg>
                {this.props.mentions > 0 &&
                <div className='lowerBadge-29hYVK pc-lowerBadge'>
                  <div className='numberBadge-2s8kKX base-PmTxvP' style={{
                    backgroundColor: 'rgb(240, 71, 71)',
                    width: '16px',
                    paddingRight: '1px'
                  }}>{this.props.mentions}</div>
                </div>}
              </div>
            </div>
          </Tooltip>
        </div>
      )}
    </Draggable>;


    return <Draggable draggableId={this.props.guild.id} index={this.props.index}>
      {(provided) => (
        <div
          onContextMenu={this.handleContextMenu.bind(this)}
          className={`listItem-2P_4kh pc-listItem`}
          ref={(r) => {
            provided.innerRef(r);
            this.props.setRef(r);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Tooltip text={this.props.guild.name} position='right'>
            <div className={`${this.wrapperClass} pc-guildInner`}>
              {/* <div className={`${this.guildClasses.guildInner}`} onContextMenu={this.handleContextMenu.bind(this)}> */}
              <Link aria-label={this.props.guild.id} to={link}>
                <div
                  className={this.iconClassName}
                  style={{
                    backgroundImage: this.props.guild.icon
                      ? `url('https://cdn.discordapp.com/icons/${this.props.guild.id}/${this.props.guild.icon}.webp')`
                      : '',
                    backgroundSize: 'contain',
                    width: 50,
                    height: 50
                  }}>{!this.props.guild.icon && this.props.guild.acronym}</div>
              </Link>
            </div>
          </Tooltip>
          {this.props.mentions > 0 &&
          <div className='powercord-mentions-badge pc-wrapper pc-badge pc-fixClipping'>{this.props.mentions}</div>}
        </div>
      )}
    </Draggable>;
  }

  handleContextMenu (e) {
    const GuildContextMenu = getModuleByDisplayName('GuildContextMenu');

    contextMenu.openContextMenu(e, (props) =>
      React.createElement(GuildContextMenu, {
        ...props,
        type: 'GUILD_ICON_BAR',
        guild: this.props.guild,
        badge: this.props.mentions > 0,
        selected: this.props.selected,
        isPowercord: true,
        hidden: this.props.hidden,
        onHide: () => this.props.onHide()
      })
    );
  }
};

const fluxShit = require('powercord/webpack').getModule([ 'getLastSelectedChannelId' ]);
module.exports = Flux.connectStores([ fluxShit ], (e) => ({ selectedChannelId: fluxShit.getChannelId(e.guild.id) }))(Guild);
