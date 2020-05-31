const { React, Flux, getModule, getModuleByDisplayName, contextMenu, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Icons: { FontAwesome } } = require('powercord/components');
const { open: openModal } = require('powercord/modal');

const { SPOTIFY_DEFAULT_IMAGE } = require('../constants');
const SpotifyAPI = require('../SpotifyAPI');
const playerStore = require('../playerStore/store');
const playerStoreActions = require('../playerStore/actions');
const AddToPlaylist = require('./AddToPlaylist');
const ContextMenu = require('./ContextMenu');
const SeekBar = require('./SeekBar');

const PanelSubtext = AsyncComponent.from(getModuleByDisplayName('PanelSubtext'));
const Tooltip = AsyncComponent.from(getModuleByDisplayName('Tooltip'));

class Modal extends React.PureComponent {
  constructor (props) {
    super(props);
    this._rerenderScheduled = false;
    this.state = {
      hover: false
    };
  }

  render () {
    if (this.props.devices.length === 0 || !this.props.currentTrack) {
      return null;
    }

    return (
      <div
        className={[ 'powercord-spotify', (this.state.hover || this.state.seeking) && 'hover' ].filter(Boolean).join(' ')}
        onMouseEnter={() => {
          this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          this.setState({ hover: false });
        }}
      >
        {this.renderFromBase()}
        {this.renderExtraControls()}
        <SeekBar
          isPlaying={this.props.playerState.playing}
          duration={this.props.currentTrack.duration}
          progress={this.props.playerState.spotifyRecordedProgress}
          progressAt={this.props.playerState.spotifyRecordedProgressAt}
          onSeeking={(seeking) => this.setState({ seeking })}
          onDurationOverflow={() => {
            const playerState = playerStore.getPlayerState();
            playerStoreActions.updatePlayerState({
              ...playerState,
              playing: false
            });
          }}
        />
      </div>
    );
  }

  renderFromBase () {
    const { avatar, avatarWrapper } = getModule([ 'container', 'usernameContainer' ], false);

    return {
      ...this.props.base,
      props: {
        ...this.props.base.props,
        onMouseEnter: () => void 0,
        onMouseLeave: () => void 0,
        onContextMenu: e => contextMenu.openContextMenu(e, () => React.createElement(ContextMenu)),
        className: `${this.props.base.props.className || ''}`,
        children: [
          (
            <div className={avatarWrapper}>
              <Tooltip text={this.props.currentTrack.album} shouldShow={this.props.currentTrack.album}>
                {(props) => (
                  <img
                    {...props}
                    alt='Spotify cover'
                    src={this.props.currentTrack.cover || SPOTIFY_DEFAULT_IMAGE}
                    className={`${avatar} spotify-cover`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: this.props.getSetting('squareCovers', false) ? 5 : '50%'
                    }}
                  />
                )}
              </Tooltip>
            </div>
          ),
          (
            <Tooltip text={this.renderNameComponent()} tooltipClassName='spotify-tooltip' delay={750}>
              {this.renderNameComponent.bind(this)}
            </Tooltip>
          ),
          {
            ...this.props.base.props.children[2],
            props: {
              ...this.props.base.props.children[2].props,
              className: `${this.props.base.props.children[2].props.className || ''} spotify-buttons`.trim(),
              children: [
                this.renderButton(() => Messages.PAGINATION_PREVIOUS, 'backward', () =>
                  SpotifyAPI.prev()),
                this.props.playerState.playing
                  ? this.renderButton(() => Messages.PAUSE, 'pause', () =>
                    SpotifyAPI.pause())
                  : this.renderButton(() => Messages.PLAY, 'play', () =>
                    SpotifyAPI.play()),
                this.renderButton(() => Messages.NEXT, 'forward', () =>
                  SpotifyAPI.next())
              ]
            }
          }
        ]
      }
    };
  }

  renderNameComponent (props = {}) {
    const nameComponent = this.props.base.props.children[1].props.children({});
    delete nameComponent.props.onMouseLeave;
    delete nameComponent.props.onMouseEnter;
    delete nameComponent.props.onClick;

    [ nameComponent.props.className ] = nameComponent.props.className.split(' ');
    Object.assign(nameComponent.props, props);
    nameComponent.props.children[0].props.className = 'spotify-title';
    nameComponent.props.children[0].props.children.props.children = this.props.currentTrack.name;
    nameComponent.props.children[1] = (
      <PanelSubtext className='spotify-artist'>
        {Messages.USER_ACTIVITY_LISTENING_ARTISTS.format({
          artists: this.props.currentTrack.artists,
          artistsHook: t => t
        })}
      </PanelSubtext>
    );
    return nameComponent;
  }

  renderExtraControls () {
    if (!this.props.getSetting('showControls', true)) {
      return null;
    }

    const hasCoolFeatures = powercord.account && powercord.account.spotify;
    return (
      <div className='spotify-extra-controls'>
        {hasCoolFeatures && this.renderAddToLibrary()}
        {this.renderShuffle()}
        {this.renderRepeat()}
        {hasCoolFeatures && this.renderAddToPlaylist()}
      </div>
    );
  }

  renderAddToLibrary () {
    switch (this.props.currentLibraryState) {
      case playerStore.LibraryState.LOCAL_SONG:
        return this.renderButton(() => Messages.SPOTIFY_CANT_LIKE_LOCAL, 'heart', () =>
          SpotifyAPI.removeSong(this.props.currentTrack.id), false, 'active');
      case playerStore.LibraryState.IN_LIBRARY:
        return this.renderButton(() => Messages.SPOTIFY_REMOVE_LIKED_SONGS, 'heart', () =>
          SpotifyAPI.removeSong(this.props.currentTrack.id), false, 'active');
      case playerStore.LibraryState.NOT_IN_LIBRARY:
        return this.renderButton(() => Messages.SPOTIFY_ADD_LIKED_SONGS, 'heart-regular', () =>
          SpotifyAPI.addSong(this.props.currentTrack.id));
      default:
        return this.renderButton(() => Messages.DEFAULT_INPUT_PLACEHOLDER, 'heart', () => void 0, true);
    }
  }

  renderShuffle () {
    if (!this.props.playerState.canShuffle) {
      return this.renderButton(() => 'Cannot shuffle right now', 'random', () => void 0, true);
    }
    const { shuffle } = this.props.playerState;
    return this.renderButton(() => 'Shuffle', 'random', () =>
      SpotifyAPI.setShuffleState(!shuffle), false, shuffle ? 'active' : '');
  }

  renderRepeat () {
    if (!this.props.playerState.canRepeat && !this.props.playerState.canRepeatOne) {
      return this.renderButton(() => 'Cannot repeat right now', 'sync', () => void 0, true);
    }

    switch (this.props.playerState.repeat) {
      case playerStore.RepeatState.NO_REPEAT:
        return this.renderButton(() => 'Repeat', 'sync', () => this.handleSetRepeat(), false);
      case playerStore.RepeatState.REPEAT_CONTEXT:
        return this.renderButton(() => 'Repeat Track', 'sync', () => this.handleSetRepeat(), false, 'active');
      case playerStore.RepeatState.REPEAT_TRACK:
        return this.renderButton(() => 'No Repeat', 'undo', () => this.handleSetRepeat(), false, 'active');
    }
  }

  renderAddToPlaylist () {
    return this.renderButton(() => 'Save to Playlist', 'plus-circle', () => this.handleAddToPlaylist());
  }

  renderButton (tooltipText, icon, onClick, disabled, className) {
    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (isPremium === null && !this._rerenderScheduled) {
      this._rerenderScheduled = true;
      setTimeout(() => this.forceUpdate(), 1e3);
    }

    if (!isPremium) {
      return null;
    }

    return {
      ...this.props.base.props.children[2].props.children[0],
      props: {
        ...this.props.base.props.children[2].props.children[0].props,
        icon: () => React.createElement(FontAwesome, {
          className,
          icon
        }),
        tooltipText: tooltipText(),
        disabled,
        onClick
      }
    };
  }

  handleSetRepeat () {
    const possibleStates = [
      playerStore.RepeatState.NO_REPEAT,
      this.props.playerState.canRepeat && playerStore.RepeatState.REPEAT_CONTEXT,
      this.props.playerState.canRepeatOne && playerStore.RepeatState.REPEAT_TRACK
    ].filter(Boolean);
    const currentIndex = possibleStates.indexOf(this.props.playerState.repeat);
    const nextState = possibleStates[(currentIndex + 1) % possibleStates.length];
    switch (nextState) {
      case playerStore.RepeatState.NO_REPEAT:
        SpotifyAPI.setRepeatState('off');
        break;
      case playerStore.RepeatState.REPEAT_CONTEXT:
        SpotifyAPI.setRepeatState('context');
        break;
      case playerStore.RepeatState.REPEAT_TRACK:
        SpotifyAPI.setRepeatState('track');
        break;
    }
  }

  handleAddToPlaylist () {
    openModal(() => React.createElement(AddToPlaylist, { track: this.props.currentTrack }));
  }
}

module.exports = Flux.connectStores(
  [ playerStore, powercord.api.settings.store ],
  (props) => ({
    ...playerStore.getStore(),
    ...powercord.api.settings._fluxProps(props.entityID)
  })
)(Modal);
