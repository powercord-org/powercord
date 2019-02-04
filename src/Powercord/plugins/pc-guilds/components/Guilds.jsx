const { React, getModule } = require('powercord/webpack');
const { DragDropContext, Droppable } = require('react-beautiful-dnd');

const Guild = require('./Guild.jsx');

module.exports = class Guilds extends React.Component {
  constructor (props) {
    super(props);

    this.onDragEnd = this._onDragEnd.bind(this);
    this.state = {
      hidden: false,
      openedFolders: []
    };
  }

  componentDidUpdate () {
    if (this.state.hidden && this.props.settings.get('hidden', []).length === 0) {
      this.setState({ hidden: false });
    }
  }

  render () {
    const hiddenGuilds = this.props.settings.get('hidden', []);
    const guilds = this._getGuilds(hiddenGuilds);

    return <DragDropContext onDragEnd={this.onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            className='powercord-guilds'
            ref={provided.innerRef}
          >
            {hiddenGuilds.length > 0 &&
            <div className='powercord-hidden-btn' onClick={() => this.setState({ hidden: !this.state.hidden })}>
              {this.state.hidden ? 'Visible' : 'Hidden'}
              {guilds.mentions.hidden > 0 && <div className='powercord-mentions-badge'>{guilds.mentions.hidden}</div>}
            </div>}

            {guilds.items.map(({ guild, index }) => <Guild
              key={guild.id}

              guild={guild}
              index={index}

              unread={this.props.unreadGuilds[guild.id]}
              mentions={this.props.mentionCounts[guild.id] || 0}

              hidden={hiddenGuilds.includes(guild.id)}
              selected={this.props.selectedGuildId === guild.id}
              audio={this.props.selectedVoiceGuildId === guild.id && this.props.mode === 'voice'}
              video={this.props.selectedVoiceGuildId === guild.id && this.props.mode === 'video'}

              setRef={e => this.props.setRef(guild.id, e)}
              onHide={() => {
                if (hiddenGuilds.includes(guild.id)) {
                  this.props.settings.set('hidden', hiddenGuilds.filter(g => g !== guild.id));
                } else {
                  this.props.settings.set('hidden', [ ...hiddenGuilds, guild.id ]);
                }
                this.forceUpdate();
              }}
            />)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>;
  }

  _getGuilds (hiddenGuilds) {
    // Remove hidden guilds from list
    let { guilds } = this.props;
    let hiddenMentions = 0;

    if (!this.state.hidden) {
      guilds = guilds.filter(({ guild }) => !hiddenGuilds.includes(guild.id));
      hiddenGuilds.forEach(g => hiddenMentions += this.props.mentionCounts[g] || 0);
    }

    return {
      items: guilds,
      mentions: {
        hidden: hiddenMentions
      },
      unreads: {}
    };
  }

  _onDragEnd (result) {
    if (!result.destination) {
      return;
    }

    const positions = this._reorder(this.props.guilds, result.source.index, result.destination.index).map(g => g.guild.id);
    const settings = getModule([ 'updateRemoteSettings' ]);
    settings.updateRemoteSettings({
      guildPositions: positions
    });
  }

  _reorder (list, startIndex, endIndex) {
    const result = Array.from(list);
    const [ removed ] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }
};
