const { React, contextMenu } = require('powercord/webpack');
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
    const artists = concat(currentItem.artists);

    const shuffleColor = this.state.shuffleState ? '#1ed860' : '#fff';
    const repeatColor = this.state.repeatState === 'off' ? '#fff' : '#1ed860';
    const repeatIcon = this.state.repeatState === 'context' ? 'sync' : 'undo';
    const libraryStatus = this.state.inLibrary === false
      ? {
        tooltip: 'Add to Library',
        icon: 'plus',
        color: '#fff',
        action: () => {
          SpotifyPlayer.addSong(this.state.currentItem.id).then(() => {
            this.setState({ inLibrary: !this.state.inLibrary });
          });
        }
      }
      : {
        tooltip: 'In Library',
        icon: 'check',
        color: '#1ed860',
        action: () => {
          SpotifyPlayer.removeSong(this.state.currentItem.id).then(() => {
            this.setState({ inLibrary: !this.state.inLibrary });
          });
        }
      };

    const libraryButton = this.state.inLibrary !== ''
      ? (<Tooltip text={libraryStatus.tooltip} position="top">
        <button
          style={{ color: libraryStatus.color }}
          className={`button-s03oPN lookBlank-3eh9lL fas fa-${libraryStatus.icon} spotify-in-library`}
          onClick={libraryStatus.action}
        />
      </Tooltip>)
      : '';
    return <>
      {this.props.main._listeningAlongComponent}
      <div
        className={`container-2Thooq powercord-spotify${this.props.getSetting('showControls', true) ? '' : ' small'}`}
        id='powercord-spotify-modal'
        onContextMenu={this.injectContextMenu.bind(this)}
        style={displayState === 'hide' ? { display: 'none' } : {}}
      >
        <Tooltip text={currentItem.albumName} position='top'>
          <div
            className='wrapper-2F3Zv8 small-5Os1Bb avatar-small avatar-3JE4B3 pc-avatar'
            style={{
              backgroundImage: `url("${currentItem.img}")`,
              backgroundSize: 'contain'
            }}
            onClick={() => shell.openExternal(currentItem.uri)}
          />
        </Tooltip>

        <div className='powercord-spotify-songInfo nameTag-LxtdSI'>
          <div className='colorStandard-2KCXvj size14-e6ZScH usernameContainer-1GWXka'>
            <Title className="username">{currentItem.name}</Title>
          </div>
          <div className='colorStandard-2KCXvj size10-tblYdA discriminator-3W31ZY'>
            <Title className="discriminator">{artists ? `by ${artists}` : ''}</Title>
          </div>
        </div>

        <div className='flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <Tooltip text='Previous' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className='button-s03oPN lookBlank-3eh9lL fas fa-backward spotify-previous'
              onClick={() => this.state.seekBar.progress + (Date.now() - this.state.seekBar.progressAt) > 5e3 ? this.onButtonClick('seek', 0) : this.onButtonClick('prev')}
            />
          </Tooltip>

          <Tooltip text={isPlaying ? 'Pause' : 'Play'} position='top'>
            <button
              style={{ color: '#1ed860' }}
              className={`button-s03oPN lookBlank-3eh9lL fas fa-${isPlaying ? 'pause' : 'play'} spotify-${isPlaying ? 'pause' : 'play'}`}
              onClick={() => this.onButtonClick(isPlaying ? 'pause' : 'play')}
            />
          </Tooltip>

          <Tooltip text='Next' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className='button-s03oPN lookBlank-3eh9lL fas fa-forward spotify-next'
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

              <Tooltip text="Shuffle" position="top">
                <button
                  style={{ color: shuffleColor }}
                  className={`button-s03oPN lookBlank-3eh9lL fas fa-random spotify-shuffle-${this.state.shuffleState ? 'on' : 'off'}}`}
                  onClick={() => this.onButtonClick('setShuffleState', !this.state.shuffleState)}
                />
              </Tooltip>

              <Tooltip text={this.repeatStruct[this.state.repeatState].tooltip} position="top">
                <button
                  style={{ color: repeatColor }}
                  className={`button-s03oPN lookBlank-3eh9lL fas fa-${repeatIcon} spotify-repeat-${this.state.repeatState}`}
                  onClick={() => this.onButtonClick('setRepeatState', this.repeatStruct[this.state.repeatState].next)}
                />
              </Tooltip>

              {powercord.account && powercord.account.spotify && <Tooltip text="Save to Playlist" position="top">
                <button
                  style={{ color: '#fff' }}
                  className='button-s03oPN lookBlank-3eh9lL fas fa-plus-circle spotify-save-to-playlist'
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
      !this.props.showAdvanced,
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
