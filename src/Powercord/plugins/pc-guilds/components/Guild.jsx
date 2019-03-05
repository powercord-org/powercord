const { React, Flux, Router: { Link }, constants: { Routes }, contextMenu, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');
const { Draggable } = window.ReactBeautifulDnd;

const Guild = class Guilds extends React.Component {
  constructor (props) {
    super(props);

    this.guildClasses = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.dragPlaceholder)[0].exports;
    this.iconClasses = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.iconActiveMini)[0].exports;
  }

  get guildClassName () {
    let className = this.guildClasses.container;
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
    let className = `${this.iconClasses.iconInactive} ${this.guildClasses.guildIcon}`;
    if (!this.props.guild.icon) {
      className += ` ${this.iconClasses.noIcon}`;
    }
    return className;
  }

  render () {
    // eslint-disable-next-line new-cap
    const link = this.props.selectedChannelId ? Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId) : Routes.GUILD(this.props.guild.id);

    return <Draggable draggableId={this.props.guild.id} index={this.props.index}>
      {(provided) => (
        <div
          className={this.guildClassName}
          ref={(r) => {
            provided.innerRef(r);
            this.props.setRef(r);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Tooltip text={this.props.guild.name} position='right'>
            <div className={`${this.guildClasses.guildInner}`} onContextMenu={this.handleContextMenu.bind(this)}>
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
