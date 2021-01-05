const { clipboard, shell } = require('electron');
const { React, Flux, getModule, messages, channels, contextMenu: { closeContextMenu }, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const { Menu } = require('powercord/components');
const { formatTime } = require('powercord/util');

const songsStore = require('../songsStore/store');
const songsStoreActions = require('../songsStore/actions');
const playerStore = require('../playerStore/store');
const SpotifyAPI = require('../SpotifyAPI');
const AddToPlaylist = require('./AddToPlaylist');

class ContextMenu extends React.PureComponent {
  constructor (props) {
    super(props);
    this.handleVolumeSlide = global._.debounce(this.handleVolumeSlide.bind(this), 200);
  }

  handleVolumeSlide (volume) {
    SpotifyAPI.setVolume(Math.round(volume));
  }

  componentDidMount () {
    if (powercord.account && powercord.account.accounts.spotify) {
      if (!this.props.songsLoaded) {
        songsStoreActions.loadSongs();
      }
      if (!this.props.topSongsLoaded) {
        songsStoreActions.loadTopSongs();
      }
      if (!this.props.albumsLoaded) {
        songsStoreActions.loadAlbums();
      }
    }
    if (!this.props.playlistsLoaded) {
      songsStoreActions.loadPlaylists();
    }
  }

  render () {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();

    return (
      <Menu.Menu navId='powercord-spotify-menu' onClose={closeContextMenu}>
        {isPremium && this.renderDevices()}
        {isPremium && this.renderSongs()}
        {isPremium && this.renderPlaybackSettings()}
        {isPremium && this.renderVolume()}
        {isPremium && this.renderSave()}
        {this.renderActions()}
      </Menu.Menu>
    );
  }

  renderDevices () {
    return (
      <Menu.MenuGroup>
        <Menu.MenuItem id='devices' label='Devices'>
          {this.props.devices.sort(d => -Number(d.is_active)).map((device, i) => (
            <>
              <Menu.MenuItem
                id={device.id}
                label={device.name}
                hint={device.type}
                disabled={i === 0}
              />
              {i === 0 && <Menu.MenuSeparator/>}
            </>
          ))}
        </Menu.MenuItem>
      </Menu.MenuGroup>
    );
  }

  renderSongs () {
    const hasCoolFeatures = powercord.account && powercord.account.accounts.spotify;

    return (
      <Menu.MenuGroup>
        <Menu.MenuItem id='playlists' label='Playlists' disabled={!this.props.playlistsLoaded}>
          {this.props.playlistsLoaded
            ? this._renderList(this.props.playlists)
            : null}
        </Menu.MenuItem>
        {hasCoolFeatures && <Menu.MenuItem id='albums' label='Albums' disabled={!this.props.albumsLoaded}>
          {this.props.albumsLoaded
            ? this._renderList(this.props.albums)
            : null}
        </Menu.MenuItem>}
        {hasCoolFeatures && <Menu.MenuItem id='top-songs' label='Top Songs' disabled={!this.props.topSongsLoaded}>
          {this.props.topSongsLoaded
            ? this._renderSongs(this.props.topSongs)
            : null}
        </Menu.MenuItem>}
        {hasCoolFeatures && <Menu.MenuItem id='songs' label='Songs' disabled={!this.props.songsLoaded}>
          {this.props.songsLoaded
            ? this._renderSongs(this.props.songs)
            : null}
        </Menu.MenuItem>}
      </Menu.MenuGroup>
    );
  }

  _renderList (list) {
    return Object.entries(list).map(([ id, item ]) => (
      <Menu.MenuItem
        id={id}
        label={item.name}
        hint={item.tracksLoaded ? `${Object.keys(item.tracks).length} tracks` : Messages.DEFAULT_INPUT_PLACEHOLDER}
        action={() => setTimeout(() => SpotifyAPI.play({ context_uri: item.uri }), 10)}
      >
        {item.tracksLoaded
          ? this._renderSongs(item.tracks, item.uri)
          : null}
      </Menu.MenuItem>
    ));
  }

  _renderSongs (list, uri) {
    return Object.entries(list).map(([ id, item ]) => (
      <Menu.MenuItem
        id={id}
        label={item.name}
        hint={formatTime(item.duration)}
        action={() => setTimeout(() => {
          if (uri) {
            SpotifyAPI.play({
              context_uri: uri,
              offset: { uri: item.uri }
            });
          } else {
            SpotifyAPI.play({
              uris: [ item.uri ]
            });
          }
        }, 10)}
      />
    ));
  }

  renderPlaybackSettings () {
    if (!powercord.account || !powercord.account.accounts.spotify) {
      return null;
    }

    const cannotAll = !this.props.playerState.canRepeat && !this.props.playerState.canRepeatOne;
    const isOff = this.props.playerState.repeat === playerStore.RepeatState.NO_REPEAT;
    const isContext = this.props.playerState.repeat === playerStore.RepeatState.REPEAT_CONTEXT;
    const isTrack = this.props.playerState.repeat === playerStore.RepeatState.REPEAT_TRACK;

    return (
      <Menu.MenuGroup>
        <Menu.MenuItem id='repeat' label='Repeat Mode' disabled={cannotAll}>
          <Menu.MenuItem
            id={`off${isOff ? '-active' : ''}`}
            label='No Repeat'
            action={() => SpotifyAPI.setRepeatState('off')}
            disabled={isOff}
          />
          <Menu.MenuItem
            id={`context${isContext ? '-active' : ''}`}
            label='Repeat'
            action={() => SpotifyAPI.setRepeatState('context')}
            disabled={isContext || !this.props.playerState.canRepeat}
          />
          <Menu.MenuItem
            id={`track${isTrack ? '-active' : ''}`}
            label='Repeat Track'
            action={() => SpotifyAPI.setRepeatState('track')}
            disabled={isTrack || !this.props.playerState.canRepeatOne}
          />
        </Menu.MenuItem>
        <Menu.MenuCheckboxItem
          id='shuffle'
          label='Shuffle'
          checked={this.props.playerState.shuffle}
          action={() => SpotifyAPI.setShuffleState(!this.props.playerState.shuffle)}
          disabled={!this.props.playerState.canShuffle}
        />
      </Menu.MenuGroup>
    );
  }

  renderVolume () {
    const Slider = getModule(m => m.render && m.render.toString().includes('sliderContainer'), false);
    return (
      <Menu.MenuGroup>
        <Menu.MenuControlItem
          id='volume'
          label='Volume'
          control={(props, ref) => (
            <Slider
              mini
              ref={ref}
              value={this.props.playerState.volume}
              onChange={this.handleVolumeSlide.bind(this)}
              {...props}
            />
          )}
        />
      </Menu.MenuGroup>
    );
  }

  renderSave () {
    if (!powercord.account || !powercord.account.accounts.spotify) {
      return null;
    }

    return (
      <Menu.MenuGroup>
        {this.props.currentLibraryState === playerStore.LibraryState.IN_LIBRARY
          ? <Menu.MenuItem
            id='remove-liked'
            label={Messages.SPOTIFY_REMOVE_LIKED_SONGS}
            action={() => SpotifyAPI.removeSong(this.props.currentTrack.id)}
            disabled={[ playerStore.LibraryState.UNKNOWN, playerStore.LibraryState.LOCAL_SONG ].includes(this.props.currentLibraryState)}
          />
          : <Menu.MenuItem
            id='save-liked'
            label={Messages.SPOTIFY_ADD_LIKED_SONGS}
            action={() => SpotifyAPI.addSong(this.props.currentTrack.id)}
            disabled={[ playerStore.LibraryState.UNKNOWN, playerStore.LibraryState.LOCAL_SONG ].includes(this.props.currentLibraryState)}
          />}
        <Menu.MenuItem
          id='save-playlist'
          label='Save to Playlist'
          action={() => openModal(() => React.createElement(AddToPlaylist, { track: this.props.currentTrack }))}
        />
      </Menu.MenuGroup>
    );
  }

  renderActions () {
    return (
      <Menu.MenuGroup>
        <Menu.MenuItem
          id='open-spotify'
          label='Open in Spotify'
          action={() => {
            const protocol = getModule([ 'isProtocolRegistered', '_dispatchToken' ], false).isProtocolRegistered();
            shell.openExternal(protocol ? this.props.currentTrack.uri : this.props.currentTrack.urls.track);
          }}
        />
        <Menu.MenuItem
          id='send-album'
          disabled={!this.props.currentTrack.urls.album}
          label='Send Album URL to Channel'
          action={() => messages.sendMessage(
            channels.getChannelId(),
            { content: this.props.currentTrack.urls.album }
          )}
        />
        <Menu.MenuItem
          id='send-song'
          label='Send Song URL to Channel'
          action={() => messages.sendMessage(
            channels.getChannelId(),
            { content: this.props.currentTrack.urls.track }
          )}
        />
        <Menu.MenuItem
          id='copy-album'
          disabled={!this.props.currentTrack.urls.album}
          label='Copy Album URL'
          action={() => clipboard.writeText(this.props.currentTrack.urls.album)}
        />
        <Menu.MenuItem
          id='copy-song'
          label='Copy Song URL'
          action={() => clipboard.writeText(this.props.currentTrack.urls.track)}
        />
      </Menu.MenuGroup>
    );
  }
}

module.exports = Flux.connectStores(
  [ songsStore, playerStore, powercord.api.settings.store ],
  (props) => ({
    ...songsStore.getStore(),
    ...playerStore.getStore(),
    ...powercord.api.settings._fluxProps(props.entityID)
  })
)(ContextMenu);
