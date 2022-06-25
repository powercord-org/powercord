const { shell } = require('electron');
const { React, Flux, getModule, getModuleByDisplayName, contextMenu, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Icon, Icons: { FontAwesome } } = require('powercord/components');
const { open: openModal } = require('powercord/modal');
const { findInReactTree } = require('powercord/util');

const { SPOTIFY_DEFAULT_IMAGE } = require('../constants');
const SpotifyAPI = require('../SpotifyAPI');
const playerStore = require('../playerStore/store');
const playerStoreActions = require('../playerStore/actions');
const AddToPlaylist = require('./AddToPlaylist');
const ContextMenu = require('./ContextMenu');
const SeekBar = require('./SeekBar');
const PayUp = require('./PayUp');

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

    const isPremium = getModule([ 'isSpotifyPremium' ], false).isSpotifyPremium();
    if (isPremium === null && !this._rerenderScheduled) {
      this._rerenderScheduled = true;
      setTimeout(() => this.forceUpdate(), 1e3);
    }

    return (
      <div
        className={[ 'powercord-spotify', (this.state.hover || this.state.seeking) && 'hover' ].filter(Boolean).join(' ')}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        {this.renderFromBase(isPremium)}
        {isPremium && this.renderExtraControls()}
        <SeekBar
          isPremium={isPremium}
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

  renderFromBase (isPremium) {
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
            <div
              className={avatarWrapper}
              onClick={() => {
                const protocol = getModule([ 'isProtocolRegistered', '_dispatchToken' ], false).isProtocolRegistered();
                shell.openExternal(protocol ? this.props.currentTrack.uri : this.props.currentTrack.urls.track);
              }}
            >
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
              {(tooltipProps) => this.renderNameComponent(tooltipProps)}
            </Tooltip>
          ),
          {
            ...this.props.base.props.children[1],
            props: {
              ...this.props.base.props.children[1].props,
              className: `${this.props.base.props.children[1].props.className || ''} spotify-buttons`.trim(),
              children: isPremium
                ? [
                  this.renderButton(() => Messages.PAGINATION_PREVIOUS, 'backward', () => SpotifyAPI.prev()),
                  this.props.playerState.playing
                    ? this.renderButton(() => Messages.PAUSE, 'pause', () => SpotifyAPI.pause())
                    : this.renderButton(() => Messages.PLAY, 'play', () => SpotifyAPI.play()),
                  this.renderButton(() => Messages.NEXT, 'forward', () => SpotifyAPI.next())
                ]
                : this.renderInfoPremium()
            }
          }
        ]
      }
    };
  }

  renderNameComponent (props = {}) {
    let NameComponent = findInReactTree(this.props.base, (n) =>
      n.props?.text === Messages.ACCOUNT_CLICK_TO_COPY && typeof n.props?.children === 'function'
    )?.props?.children?.({});

    if (NameComponent) {
      delete NameComponent.props.onClick;
      delete NameComponent.props.onMouseEnter;
      delete NameComponent.props.onMouseLeave;
    } else {
      const AvatarPopout = findInReactTree(this.props.base, (n) => typeof n.props?.children === 'function')?.props?.children?.({});
      const AvatarWithUsername = findInReactTree(AvatarPopout, (n) => typeof n.props?.children === 'function')?.props?.children?.({});

      NameComponent = AvatarWithUsername?.props?.children?.[1];
    }

    Object.assign(NameComponent.props, props);

    const NameChildren = NameComponent.props.children;
    const Title = NameChildren?.props?.children?.[0];
    const Subtext = NameChildren?.props?.children?.[1];

    if (!Title || !Subtext) {
      return null;
    }

    Title.props.className = 'spotify-title';
    Title.props.children.props.children = this.props.currentTrack.name;
    NameChildren.props.children[1] = (
      <PanelSubtext className='spotify-artist'>
        {Messages.USER_ACTIVITY_LISTENING_ARTISTS.format({
          artists: this.props.currentTrack.artists,
          artistsHook: t => t
        })}
      </PanelSubtext>
    );

    return NameComponent;
  }

  renderExtraControls () {
    if (!this.props.getSetting('showControls', true)) {
      return null;
    }

    const hasCoolFeatures = powercord.account && powercord.account.accounts.spotify;
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
    return {
      ...this.props.base.props.children[1].props.children[0],
      props: {
        ...this.props.base.props.children[1].props.children[0].props,
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

  renderInfoPremium () {
    return {
      ...this.props.base.props.children[1].props.children[0],
      props: {
        ...this.props.base.props.children[1].props.children[0].props,
        tooltipText: 'Not seeing controls?',
        icon: () => React.createElement(Icon, {
          name: 'Info',
          width: 20,
          height: 20,
          style: { color: 'var(--interactive-normal)' }
        }),
        onClick: () => openModal(() => React.createElement(PayUp))
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
