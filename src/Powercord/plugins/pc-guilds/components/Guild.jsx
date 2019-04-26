const { React, Flux, Router: { Link }, constants: { Routes }, contextMenu, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Icon: DiscordIcon, Tooltip } = require('powercord/components');
const { Draggable } = window.ReactBeautifulDnd;

const BlobMask = AsyncComponent.from(getModuleByDisplayName('BlobMask'));

let badgesLength,
  guildClasses,
  listItemClasses,
  numberBadgeClasses,
  wrapperItemClasses,
  blobContainerClasses;

const Icon = ({ name }) => <div className={`${numberBadgeClasses.iconBadge} ${listItemClasses.iconBadge}`}>
  <DiscordIcon className={numberBadgeClasses.icon} name={name}/>
</div>;

const NumberBadge = ({ count }) => <div
  className={`${numberBadgeClasses.numberBadge} ${numberBadgeClasses.base}`}
  style={{
    backgroundColor: 'rgb(240, 71, 71)',
    width: badgesLength.getBadgeWidthForValue(count),
    paddingRight: 1
  }}
>
  {count}
</div>;

const Guild = class Guild extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      hovered: false,
      modules: {
        badgesLength,
        guildClasses,
        listItemClasses,
        numberBadgeClasses,
        wrapperItemClasses,
        blobContainerClasses
      }
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

    if (this.state.hovered) {
      notifStyle.height = '20px';
    }

    if (this.props.selected) {
      notifStyle.height = '40px';
    }

    return notifStyle;
  }

  get guildClassNames () {
    let className = listItemClasses.listItem;
    if (this.props.unread) {
      className += ' pc-unread';
    }
    if (this.props.selected) {
      className += ' pc-selected';
    }
    if (this.props.audio) {
      className += ' pc-guild-audio';
    }
    if (this.props.video) {
      className += ' pc-guild-video';
    }
    if (this.props.mentions > 0) {
      className += ' pc-mentioned';
    }
    return className;
  }

  async componentDidMount () {
    if (!guildClasses) {
      badgesLength = await getModule([ 'getBadgeWidthForValue' ]);
      guildClasses = await getModule([ 'acronym', 'wrapper' ]);
      listItemClasses = await getModule([ 'guildSeparator', 'listItem' ]);
      numberBadgeClasses = await getModule([ 'numberBadge', 'base' ]);
      wrapperItemClasses = await getModule([ 'wrapper', 'item' ]);
      blobContainerClasses = await getModule([ 'blobContainer' ]);
      this.setState({
        badgesLength,
        guildClasses,
        listItemClasses,
        numberBadgeClasses,
        wrapperItemClasses,
        blobContainerClasses
      });
    }
  }

  render () {
    if (!guildClasses) {
      return null;
    }

    // eslint-disable-next-line new-cap
    const link = this.props.selectedChannelId ? Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId) : Routes.GUILD(this.props.guild.id);

    return <Draggable draggableId={this.props.guild.id} index={this.props.index}>
      {(provided) => (
        <div
          onContextMenu={this.handleContextMenu.bind(this)}
          className={this.guildClassNames}
          ref={(r) => {
            provided.innerRef(r);
            this.props.setRef(r);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={`${blobContainerClasses.pill} ${wrapperItemClasses.wrapper}`}>
            <span className={wrapperItemClasses.item} style={this.notifStyle}/>
          </div>
          <Tooltip
            text={this.props.guild.name}
            position='right'
          >
            <div className={blobContainerClasses.blobContainer}>
              <BlobMask
                lowerBadge={this.props.mentions > 0
                  ? <NumberBadge count={this.props.mentions}/>
                  : null
                }
                upperBadge={this.props.audio
                  ? <Icon name={DiscordIcon.Names.NOVA_SPEAKER}/>
                  : this.props.video
                    ? <Icon name={DiscordIcon.Names.NOVA_CAMERA}/>
                    : null
                }
                selected={this.props.selected || this.state.hovered}
                lowerBadgeWidth={badgesLength.getBadgeWidthForValue(this.props.mentions)}
              >
                <Link
                  onMouseEnter={() => this.setState({ hovered: true })}
                  onMouseLeave={() => this.setState({ hovered: false })}
                  className={guildClasses.wrapper}
                  aria-label='aa'
                  to={link}
                >
                  {this.props.guild.icon
                    ? <img
                      className={guildClasses.icon} alt='Server Icon' width='48' height='48'
                      src={`https://cdn.discordapp.com/icons/${this.props.guild.id}/${this.props.guild.icon}.png`
                      }/>
                    : <div
                      className={guildClasses.acronym}
                      aria-label='Server Acronym'
                    >
                      {this.props.guild.acronym}
                    </div>}
                </Link>
              </BlobMask>
            </div>
          </Tooltip>
        </div>
      )}
    </Draggable>;
  }

  handleContextMenu (e) {
    const GuildContextMenu = getModuleByDisplayName('GuildContextMenu', false);

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

let connectedModule = null;
const provider = async () => {
  if (!connectedModule) {
    const fluxShit = await getModule([ 'getLastSelectedChannelId' ]);
    connectedModule = Flux.connectStores([ fluxShit ], (e) => ({ selectedChannelId: fluxShit.getChannelId(e.guild.id) }))(Guild);
  }
  return connectedModule;
};

module.exports = (props) => <AsyncComponent _provider={provider} {...props}/>;
