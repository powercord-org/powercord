const { React } = require('powercord/webpack');

const Guild = require('./Guild.jsx');

module.exports = class Guilds extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      hidden: false,
      openedFolders: []
    };
  }

  render () {
    const guilds = this.getGuilds();

    return <div className='powercord-guilds'>
      <div className='powercord-hidden-btn'>
        Hidden
        <div className='powercord-mentions-badge'>{guilds.mentions.hidden}</div>
      </div>

      {guilds.items.map(g => <Guild
        key={g.guild.id}

        guild={g.guild}
        index={g.index}

        unread={this.props.unreadGuilds[g.guild.id]}
        mentions={this.props.mentionCounts[g.guild.id] || 0}

        selected={this.props.selectedGuildId === g.guild.id}
        audio={this.props.selectedVoiceGuildId === g.guild.id && this.props.mode === 'voice'}
        video={this.props.selectedVoiceGuildId === g.guild.id && this.props.mode === 'video'}

        setRef={(e) => {
          this.props.setRef(g.guild.id, e);
        }}
      />)}
    </div>;
  }

  getGuilds () {
    return {
      items: this.props.guilds,
      mentions: {
        hidden: 1
      },
      unreads: {}
    };
  }
};
