const { DragDropContext, Droppable } = window.ReactBeautifulDnd;
const { React, getModule } = require('powercord/webpack');

const Guild = require('./Guild.jsx');
const Folder = require('./Folder.jsx');
const NumberBadge = require('./NumberBadge.jsx');

let unreadStore = getModule([ 'getGuildUnreadCount' ], false); // Try to load it

module.exports = class Guilds extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      hidden: false,
      openedFolders: []
    };
  }

  async componentDidMount () {
    if (!unreadStore) {
      console.log('force updating');
      unreadStore = await getModule([ 'getGuildUnreadCount' ]);
      this.forceUpdate(); // memes
    }
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
              {guilds.mentions.hidden > 0 && <NumberBadge count={guilds.mentions.hidden}/>}
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

      hidden={hiddenGuilds.includes(guild.id)}
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

    guilds = guilds.map(guildId => {
      const guild = this.props.store.getGuild(guildId);
      if (!guild) {
        return null;
      }
      if (hiddenGuilds.includes(guildId)) {
        toggledMentions += this.state.hidden ? 0 : (unreadStore ? unreadStore.getMentionCount(guildId) : 0);
        return this.state.hidden ? guild : null;
      }
      toggledMentions += !this.state.hidden ? 0 : (unreadStore ? unreadStore.getMentionCount(guildId) : 0);
      return this.state.hidden ? null : guild;
    }).filter(g => g);

    return {
      items: guilds,
      mentions: {
        hidden: toggledMentions
      },
      unreads: {}
    };
  }
};
