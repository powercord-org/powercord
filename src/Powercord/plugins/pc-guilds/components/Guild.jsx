const { React, Flux, Router: { Link }, constants: { Routes }, contextMenu, getModuleByDisplayName } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

const Guild = class Guilds extends React.Component {
  constructor (props) {
    super(props);

    this.guildClasses = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.downloadAppButton)[0].exports;
    this.iconClasses = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.iconActiveMini)[0].exports;
    this.contextMenuClass = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.contextMenu)[0].exports.contextMenu;
  }

  get guildClassName () {
    let className = this.guildClasses.guild;
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
    const link = this.props.selectedChannelId ? Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId) : Routes.GUILD(this.props.guild.id); // eslint-disable-line new-cap

    return <div className={this.guildClassName} ref={this.props.setRef}>
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
      <div className="powercord-guild-mentions pc-wrapper pc-badge pc-fixClipping">{this.props.mentions}</div>}
    </div>;
  }

  handleContextMenu (e) {
    const GuildContextMenu = getModuleByDisplayName('GuildContextMenu');

    const { pageX, pageY } = e;

    contextMenu.openContextMenu(e, () =>
      React.createElement(GuildContextMenu, {
        type: 'GUILD_ICON_BAR',
        guild: this.props.guild,
        badge: this.props.mentions > 0,
        selected: this.props.selected,
        style: {
          left: pageX,
          top: pageY
        },
        className: `${this.contextMenuClass} theme-dark`,
        isPowercord: true
      })
    );
  }
};

const fluxShit = require('powercord/webpack').getModule([ 'getLastSelectedChannelId' ]);
module.exports = Flux.connectStores([ fluxShit ], (e) => ({ selectedChannelId: fluxShit.getChannelId(e.guild.id) }))(Guild);
