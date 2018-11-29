const { React, contextMenu } = require('ac/webpack');
const { ContextMenu } = require('ac/components');
const { concat } = require('ac/util');

const SpotifyPlayer = require('../SpotifyPlayer.js');
const getContextMenuItemGroups = require('./contextMenuGroups');
const SeekBar = require('./SeekBar.jsx');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.state = {
      currentItem: {
        name: '',
        artists: [ '' ],
        img: '',
        url: '',
        duration: 0
      },
      isPlaying: true,
      volume: 0,
      deviceID: '',
      repeatState: '',
      seekBar: {
        showDurations: false,
        progress: 0,
        renderInterval: null,
        progressAt: Date.now(),
        seekListeners: {
          seek: null,
          stop: null
        },
      },
      displayState: 'hide'
    };
  }

  updateData (playerState) {
    if (playerState) {
      return this.setState({
        currentItem: {
          name: playerState.item.name,
          artists: playerState.item.artists.map(artist => artist.name),
          img: playerState.item.album.images[0].url,
          url: playerState.item.external_urls.spotify,
          duration: playerState.item.duration_ms
        },
        seekBar: {
          progressAt: Date.now(),
          progress: this.state.seekBar.seeking
            ? this.state.seekBar.progress
            : playerState.progress_ms,
          seeking: false
        },
        repeatState: playerState.repeat_state,
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
          const { devices } = await SpotifyPlayer.getDevices();
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

    let className = 'container-2Thooq aethcord-spotify';
    if (this.state.seekBar.showDurations) {
      className += ' expend';
    }

    return (
      <div
        className={className}
        id='aethcord-spotify-modal'
        onContextMenu={this.injectContextMenu.bind(this)}
        style={displayState === 'hide' ? { display: 'none' } : {}}
      >
        <div
          className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
          style={{ backgroundImage: `url("${currentItem.img}")` }}
        />
        <div className='accountDetails-3k9g4n nameTag-m8r81H'>
          <span className="username">{currentItem.name}</span>
          <span className="discriminator">{artists ? `by ${artists}` : ''}</span>
        </div>

        <div className='flex-11O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
            onClick={() => this.onButtonClick('prev')}
          />

          <button
            style={{ color: '#1ed860' }}
            className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${isPlaying ? 'pause' : 'play'}`}
            onClick={() => this.onButtonClick(isPlaying ? 'pause' : 'play')}
          />

          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
            onClick={() => this.onButtonClick('next')}
          />

          <SeekBar
            main={this}
          />
        </div>
      </div>
    );
  }

  async injectContextMenu (event) {
    const { pageX, pageY } = event;

    contextMenu.openContextMenu(event, () =>
      React.createElement(ContextMenu, {
        pageX,
        pageY,
        itemGroups: getContextMenuItemGroups(this.state, this.onButtonClick)
      })
    );
  }
};