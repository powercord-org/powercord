const { React, contextMenu, i18n: { Messages } } = require('powercord/webpack');
const { ContextMenu, Tooltip } = require('powercord/components');
const { concat } = require('powercord/util');
const { shell } = require('electron');

const SpotifyPlayer = require('../SpotifyPlayer.js');
let getContextMenuItemGroups = require('./contextMenuGroups');
const SeekBar = require('./SeekBar.jsx');
const Title = require('./Title.jsx');

let oldState = null;

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.onData = this.onData.bind(this);

    this.repeatStruct = {
      off: {
        tooltip: 'Repeat',
        next: 'context'
      },
      context: {
        tooltip: 'Repeat Track',
        next: 'track'
      },
      track: {
        tooltip: 'Repeat Off',
        next: 'off'
      }
    };

    this.state = oldState || {
      currentItem: {
        name: '',
        artists: [ '' ],
        img: '',
        url: '',
        duration: 0,
        id: ''
      },
      isPlaying: true,
      volume: 0,
      deviceID: '',
      repeatState: 'off',
      shuffleState: '',
      disallowedActions: {
        toggling_shuffle: false,
        toggling_repeat_track: false,
        toggling_repeat_context: false
      },
      inLibrary: '',
      seekBar: {
        seeking: false,
        showDurations: false,
        progress: 0,
        progressAt: Date.now()
      },
      displayState: 'hide',
      spotifyLogo: ''
    };
  }

  stopTimer () {
    if (this.libraryTimer) {
      clearTimeout(this.libraryTimer);
    }
  }

  componentDidUpdate (oldProps, oldState) {
    if (oldState.currentItem.id !== this.state.currentItem.id && this.state.currentItem.id !== '') {
      this.stopTimer();
      this.setState({ inLibrary: '' });
      this.libraryTimer = setTimeout(() => {
        if (this.props.getSetting('showControls', true) && powercord.account && powercord.account.spotify) {
          SpotifyPlayer.checkLibrary(this.state.currentItem.id).then((r) => {
            this.setState({ inLibrary: r.body[0] });
          });
        }
      }, 2000);
    }
  }

  shouldComponentUpdate (_, newState) {
    if (!this._settings === this.props.getSetting('showControls', true)) {
      this._settings = this.props.getSetting('showControls', true);
      return true;
    }

    return this.repeatStruct[this.state.repeatState].next === newState.repeatState ||
      this.state.repeatState === newState.repeatState ||
      this.state.displayState !== newState.displayState;
  }

  getSpotifyLogo () {
    powercord.pluginManager.plugins.get('pc-spotify').getSpotifyLogo()
      .then(value => {
        const base64String = `data:image/png;base64,${value}`;
        this.setState({ spotifyLogo: base64String });
      });
  }

  updateData (playerState) {
    if (playerState && playerState.currently_playing_type === 'track') {
      return this.setState({
        currentItem: {
          name: playerState.item.name,
          artists: playerState.item.artists.map(artist => artist.name),
          img: !playerState.item.is_local ? playerState.item.album.images[0].url : this.state.spotifyLogo,
          albumName: playerState.item.album.name,
          url: playerState.item.external_urls.spotify,
          uri: playerState.item.uri,
          duration: playerState.item.duration_ms,
          id: !playerState.item.is_local ? playerState.item.id : null
        },
        seekBar: {
          progressAt: Date.now(),
          progress: playerState.progress_ms,
          seeking: this.state.seekBar.seeking
        },
        inLibrary: this.state.inLibrary,
        repeatState: playerState.repeat_state,
        shuffleState: playerState.shuffle_state,
        disallowedActions: playerState.actions.disallows,
        isPlaying: playerState.is_playing,
        volume: playerState.device.volume_percent,
        deviceID: playerState.device.id,
        displayState: 'show'
      });
    }
  }

  async onData (data) {
    switch (data.type) {
      case 'PLAYER_STATE_CHANGED':
        return this.updateData(data.event.state);

      case 'DEVICE_STATE_CHANGED': {
        const { devices } = await SpotifyPlayer.getDevices();
        if (!devices[0]) {
          return this.setState({
            displayState: 'hide'
          });
        }
        break;
      }

      case 'track':
        if (data.identifier === this.state.currentItem.id) {
          this.stopTimer();
          this.setState({ inLibrary: !data.removed });
        }
    }
  }

  async componentDidMount () {
    this.props.main._forceUpdate = this.forceUpdate.bind(this);
    this.props.main.on('event', this.onData);
    this.getSpotifyLogo();
    this.updateData(await SpotifyPlayer.getPlayer());
  }

  componentWillUnmount () {
    oldState = this.state;
    this.props.main.off('event', this.onData);
  }

  onButtonClick (method, ...args) {
    return SpotifyPlayer[method](...args)
      .then(() => true);
  }

  render () {
    const { currentItem, isPlaying, displayState } = this.state;
    const artists = concat(currentItem.artists, ',');
    const { containerClasses } = this.props.main;

    const repeatIcon = this.state.repeatState === 'context' ? 'sync' : 'undo';
    const libraryStatus = this.state.inLibrary === false
      ? {
        tooltip: 'Save to Liked Songs',
        icon: 'far fa-heart',
        action: () => {
          SpotifyPlayer.addSong(this.state.currentItem.id).then(() => {
            this.setState({ inLibrary: !this.state.inLibrary });
          });
        }
      }
      : {
        tooltip: 'Remove from Liked Songs',
        icon: 'fas fa-heart active',
        action: () => {
          SpotifyPlayer.removeSong(this.state.currentItem.id).then(() => {
            this.setState({ inLibrary: !this.state.inLibrary });
          });
        }
      };

    const libraryButton = this.state.inLibrary !== ''
      ? (<Tooltip text={libraryStatus.tooltip} position="top">
        <button
          className={`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} ${libraryStatus.icon} spotify-in-library`}
          onClick={libraryStatus.action}
        />
      </Tooltip>)
      : '';
    const shuffleButton = !this.state.disallowedActions.toggling_shuffle
      ? (<Tooltip text="Shuffle" position="top">
        <button
          className={`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} fas fa-random spotify-shuffle-${this.state.shuffleState ? 'on' : 'off'} ${this.state.shuffleState ? 'active' : ''}`}
          onClick={() => this.onButtonClick('setShuffleState', !this.state.shuffleState)}
        />
      </Tooltip>)
      : (<button
        style={{
          opacity: 0.25
        }}
        className={`${[ containerClasses.button, containerClasses.disabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} fas fa-random spotify-shuffle-${this.state.shuffleState ? 'on' : 'off'} ${this.state.shuffleState ? 'active' : ''}`}
        disabled
      />);
    const repeatButton = !this.state.disallowedActions.toggling_repeat_track && !this.state.disallowedActions.toggling_repeat_context
      ? (<Tooltip text={this.repeatStruct[this.state.repeatState].tooltip} position="top">
        <button
          className={`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} fas fa-${repeatIcon} spotify-repeat-${this.state.repeatState} ${this.state.repeatState !== 'off' ? 'active' : ''}`}
          onClick={() => this.onButtonClick('setRepeatState', this.repeatStruct[this.state.repeatState].next)}
        />
      </Tooltip>)
      : (<button
        style={{
          opacity: 0.25
        }}
        className={`${[ containerClasses.button, containerClasses.disabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} fas fa-${repeatIcon} spotify-repeat-${this.state.repeatState} ${this.state.repeatState !== 'off' ? 'active' : ''}`}
        disabled
      />);

    return <>
      {this.props.main._listeningAlongComponent}
      <div
        className={`${containerClasses.container} powercord-spotify${this.props.getSetting('showControls', true) ? '' : ' small'}`}
        id='powercord-spotify-modal'
        onContextMenu={this.injectContextMenu.bind(this)}
        style={displayState === 'hide' ? { display: 'none' } : {}}
      >

        <Tooltip text={currentItem.albumName} position='top'>
          <div className={containerClasses.avatarWrapper}>
            <div
              className={[ containerClasses.avatar, containerClasses.wrapper ].join(' ')}
              style={{
                backgroundImage: `url(${currentItem.img})`,
                backgroundSize: 'contain',
                borderRadius: this.props.getSetting('squareCovers', false) ? 5 : '50%',
                height: '32px',
                width: '32px'
              }}
              onClick={() => shell.openExternal(currentItem.uri)}
            />
          </div>
        </Tooltip>

        <div className={`powercord-spotify-songInfo ${containerClasses.nameTag}`}>
          <div
            className={[ containerClasses.colorStandard, containerClasses.size14, containerClasses.usernameContainer ].join(' ')}>
            <Title className='username'>{currentItem.name}</Title>
          </div>
          <Title className={`${[ containerClasses.size10, containerClasses.subtext ].join(' ')} discriminator`}>
            {artists
              ? Messages.USER_ACTIVITY_LISTENING_ARTISTS.format({
                artists,
                artistsHook: t => t
              })
              : ''}
          </Title>
        </div>

        <div
          className={[ containerClasses.flex, containerClasses.horizontal, containerClasses.directionRow, containerClasses.justifyRow, containerClasses.alignStretch, containerClasses.noWrap ].join(' ')}>
          <Tooltip text='Previous' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className={`${`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')}`} fas fa-backward spotify-previous`}
              onClick={() => this.state.seekBar.progress + (Date.now() - this.state.seekBar.progressAt) > 5e3 ? this.onButtonClick('seek', 0) : this.onButtonClick('prev')}
            />
          </Tooltip>
          <Tooltip text={isPlaying ? 'Pause' : 'Play'} position='top'>
            <button
              style={{ color: '#1ed860' }}
              className={`${`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')}`} fas fa-${isPlaying ? 'pause' : 'play'} spotify-${isPlaying ? 'pause' : 'play'}`}
              onClick={() => this.onButtonClick(isPlaying ? 'pause' : 'play')}
            />
          </Tooltip>
          <Tooltip text='Next' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className={`${`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')}`} fas fa-forward spotify-next`}
              onClick={() => this.onButtonClick('next')}
            />
          </Tooltip>

          <SeekBar
            {...this.state.seekBar}
            isPlaying={this.state.isPlaying}
            duration={this.state.currentItem.duration}
            onSeeking={(seeking) => this.setState({
              seekBar: {
                ...this.state.seekBar,
                seeking
              }
            })}
          >
            {this.props.getSetting('showControls', true) && <div className="powercord-spotify-seek-btngrp">
              {libraryButton}
              {shuffleButton}
              {repeatButton}
              {powercord.account && powercord.account.spotify && <Tooltip text="Save to Playlist" position="top">
                <button
                  className={`${[ containerClasses.button, containerClasses.enabled, containerClasses.lookBlank, containerClasses.colorBrand, containerClasses.grow ].join(' ')} fas fa-plus-circle spotify-save-to-playlist`}
                  onClick={() => powercord.pluginManager.get('pc-spotify').openPlaylistModal(currentItem.uri)}
                />
              </Tooltip>}
            </div>}
          </SeekBar>
        </div>
      </div>
    </>;
  }

  async injectContextMenu (e) {
    getContextMenuItemGroups = require('./contextMenuGroups'); // override reference from require cache in the event of any mods
    const { pageX, pageY } = e;
    const itemGroups = getContextMenuItemGroups(
      this.state,
      this.onButtonClick,
      powercord.account && powercord.account.spotify,
      !this.props.getSetting('showControls', true),
      !this.props.getSetting('showContextIcons', true)
    );
    contextMenu.openContextMenu(e, () =>
      React.createElement(ContextMenu, {
        pageX,
        pageY,
        itemGroups
      })
    );
  }
};
