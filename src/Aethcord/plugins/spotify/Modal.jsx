const { React, spotify } = require('ac/webpack');
const { concat } = require('ac/util');
const SpotifyPlayer = require('./SpotifyPlayer.js');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.state = {
      currentItem: {
        name: '',
        artists: [ '' ],
        img: ''
      },
      isPlaying: true
    };
  }

  updateData (playerState) {
    return this.setState({
      currentItem: {
        name: playerState.item.name,
        artists: playerState.item.artists.map(artist => artist.name),
        img: playerState.item.album.images[0].url
      },
      isPlaying: playerState.is_playing
    })
  }

  async componentDidMount () {
    this.props.main.on('event', (data) => {
      if (data.type === 'PLAYER_STATE_CHANGED') {
        this.updateData(data.event.state);
      }
    });

    return this.updateData(
      await SpotifyPlayer.getPlayer(
        await spotify.getAccessToken()
      )
    );
  }

  render () {
    const { currentItem, isPlaying } = this.state;
    const artists = concat(currentItem.artists);

    const onButtonClick = (type) => async () => SpotifyPlayer[type](await spotify.getAccessToken())

    return (
      <div className='container-2Thooq'>
        <div
          className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
          style={{ backgroundImage: `url("${currentItem.img}")` }}
        />
        <div className='accountDetails-3k9g4n nameTag-m8r81H'>
          <span class="username">{currentItem.name}</span>
          <span class="discriminator">{artists ? `by ${artists}` : ''}</span>
        </div>

        <div className='flex-11O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
            onClick={onButtonClick('prev')}
          />

          <button
            style={{ color: '#1ed860' }}
            className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${isPlaying ? 'pause' : 'play'}`}
            onClick={onButtonClick(isPlaying ? 'pause' : 'resume')}
          />

          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
            onClick={onButtonClick('next')}
          />
        </div>
      </div>
    );
  }
};
