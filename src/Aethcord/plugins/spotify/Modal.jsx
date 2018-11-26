const { React } = require('ac/webpack');
const { concat } = require('ac/util');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.state = {
      currentItem: {
        name: 'Sunset Lover',
        artists: [ 'Petit Biscuit' ],
        img: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/57/Sunset_Lover_cover.jpg/220px-Sunset_Lover_cover.jpg'
      },
      isPlaying: true
    };
  }

  render () {
    const { currentItem, isPlaying } = this.state;

    let artists = concat(currentItem.artists);
    if (artists.length > 18) {
      artists = `${artists.slice(0, 18)}...`;
    }

    return (
      <div className='container-2Thooq'>
        <div
          className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
          style={{ backgroundImage: `url("${currentItem.img}")` }}
        />
        <div className='accountDetails-3k9g4n nameTag-m8r81H'>
          <span class="username">{currentItem.name}</span>
          <span class="discriminator">by {artists}</span>
        </div>

        <div className='flex-11O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
          />

          <button
            style={{ color: '#1ed860' }}
            className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${isPlaying ? 'pause' : 'play'}`}
          />

          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
          />
        </div>
      </div>
    );
  }
};
