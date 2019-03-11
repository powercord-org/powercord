const { DragDropContext, Droppable } = window.ReactBeautifulDnd;
const { React } = require('powercord/webpack');

const Guild = require('./Guild.jsx');
const Folder = require('./Folder.jsx');

module.exports = class Guilds extends React.Component {
  constructor (props) {
    super(props);

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
    const guilds = this._getGuilds();

    return <DragDropContext onDragEnd={this.props.store.handleDnD.bind(this.props.store)}>
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

            {guilds.items.map((guild, index) => this.renderItem(guild, index))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>;
  }

  renderItem (guild, index) {
    const hiddenGuilds = this.props.settings.get('hidden', []);
    if (guild.guilds) {
      return <Folder folder={guild} index={index}/>;
    }

    return <Guild
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
    />;
  }

  _getGuilds () {
    const hiddenGuilds = this.props.settings.get('hidden', []);
    let guilds = this.props.store.getGuilds();
    let toggledMentions = 0;

    guilds = guilds.filter(guild => {
      if (hiddenGuilds.includes(guild.id)) {
        toggledMentions += this.state.hidden ? 0 : this.props.mentionCounts[guild.id];
        return this.state.hidden;
      }
      toggledMentions += !this.state.hidden ? 0 : this.props.mentionCounts[guild.id];
      return !this.state.hidden;
    });

    return {
      items: guilds,
      mentions: {
        hidden: toggledMentions
      },
      unreads: {}
    };
  }
};
