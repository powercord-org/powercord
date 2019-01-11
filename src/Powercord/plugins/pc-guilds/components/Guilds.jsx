const { React } = require('powercord/webpack');

const Guild = require('./Guild.jsx');

module.exports = class Guilds extends React.Component {
  render () {
    return this.props.guilds.map(g => <Guild
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
    />);
  }
};
