const { React, contextMenu } = require('powercord/webpack');
const { ContextMenu, Tooltip } = require('powercord/components');
const { concat } = require('powercord/util');

const SpotifyPlayer = require('../SpotifyPlayer.js');
const getContextMenuItemGroups = require('./contextMenuGroups');
const SeekBar = require('./SeekBar.jsx');
const Title = require('./Title.jsx');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

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

    this.state = {
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
      displayState: 'hide'
    };
  }

  componentDidUpdate (oldProps, oldState) {
    if (oldState.currentItem.id !== this.state.currentItem.id && this.state.currentItem.id !== '') {
      this.setState({ inLibrary: '' });
      setTimeout(() => {
        SpotifyPlayer.checkLibrary(this.state.currentItem.id).then((r) => {
          this.setState({ inLibrary: r.body[0] });
        });
      }, 5000);
    }
  }

  shouldComponentUpdate (newProps, newState) {
    return this.repeatStruct[this.state.repeatState].next === newState.repeatState || this.state.repeatState === newState.repeatState;
  }

  updateData (playerState) {
    if (playerState && playerState.currently_playing_type !== 'unknown') {
      return this.setState({
        currentItem: {
          name: playerState.item.name,
          artists: playerState.item.artists.map(artist => artist.name),
          img: !playerState.item.is_local ? playerState.item.album.images[0].url : null,
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

  async componentDidMount () {
    this.props.main.on('event', async (data) => {
      switch (data.type) {
        case 'PLAYER_STATE_CHANGED':
          return this.updateData(data.event.state);

        case 'DEVICE_STATE_CHANGED':
          const { devices } = await SpotifyPlayer.getDevices(); // eslint-disable-line
          if (!devices[0]) {
            return this.setState({
              displayState: 'hide'
            });
          }
      }
    });
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
          className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${libraryStatus.icon}`}
          onClick={libraryStatus.action}
        />
      </Tooltip>)
      : '';
    return (
      <div
        className='container-2Thooq powercord-spotify'
        id='powercord-spotify-modal'
        onContextMenu={this.injectContextMenu.bind(this)}
        style={displayState === 'hide' ? { display: 'none' } : {}}
      >
        <Tooltip text={currentItem.albumName} position='top'>
          <div
            className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
            style={{ backgroundImage: `url("${currentItem.img}")` }}
          >
          </div>
        </Tooltip>

        <div className='powercord-spotify-songInfo accountDetails-3k9g4n nameTag-m8r81H'>
          <Title className="username">{currentItem.name}</Title>
          <Title className="discriminator">{artists ? `by ${artists}` : ''}</Title>
        </div>

        <div className='flex-11O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <Tooltip text='Previous' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
              onClick={() => this.state.seekBar.progress + (Date.now() - this.state.seekBar.progressAt) > 5e3 ? this.onButtonClick('seek', 0) : this.onButtonClick('prev')}
            />
          </Tooltip>

          <Tooltip text={isPlaying ? 'Pause' : 'Play'} position='top'>
            <button
              style={{ color: '#1ed860' }}
              className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${isPlaying ? 'pause' : 'play'}`}
              onClick={() => this.onButtonClick(isPlaying ? 'pause' : 'play')}
            />
          </Tooltip>

          <Tooltip text='Next' position='top'>
            <button
              style={{ color: '#1ed860' }}
              className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
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
            <div className="powercord-spotify-seek-btngrp">
              {libraryButton}

              <Tooltip text="Shuffle" position="top">
                <button
                  style={{ color: shuffleColor }}
                  className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-random'
                  onClick={() => this.onButtonClick('setShuffleState', !this.state.shuffleState)}
                />
              </Tooltip>

              <Tooltip text={this.repeatStruct[this.state.repeatState].tooltip} position="top">
                <button
                  style={{ color: repeatColor }}
                  className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${repeatIcon}`}
                  onClick={() => this.onButtonClick('setRepeatState', this.repeatStruct[this.state.repeatState].next)}
                />
              </Tooltip>
            </div>
          </SeekBar>
        </div>
      </div>
    );
  }


  async injectContextMenu (e) {
    const { pageX, pageY } = e;

    const itemGroups = getContextMenuItemGroups(
      this.state,
      this.onButtonClick,
      powercord.account && powercord.account.spotify
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
