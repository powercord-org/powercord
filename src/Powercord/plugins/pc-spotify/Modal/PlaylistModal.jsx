const { React } = require('powercord/webpack');
const { FormTitle } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

const SpotifyPlayer = require('../SpotifyPlayer');

class Playlist extends React.Component {
  handleClick () {
    if (SpotifyPlayer.player.item.uri) {
      SpotifyPlayer.addToPlaylist(this.props.item.id, SpotifyPlayer.player.item.uri).then(() => {
        closeModal();
      });
    }
  }

  render () {
    const image = this.props.item.images[0]
      ? <img className='image' alt='cover' src={this.props.item.images[0].url} height='50' width="50" />
      : <img className='image' alt='cover' src={this.props.spotifyImg} height='50' />;
    return (
      <div className='powercord-spotify-playlist' onClick={() => this.handleClick() }>
        {image}
        <span className='name'>{this.props.item.name}</span>
      </div>
    );
  }
}

module.exports = class PlaylistModal extends React.Component {
  constructor () {
    super();
    this.state = { playlists: [],
      spotifyImg: '' };
  }

  componentDidMount () {
    Promise.all([ SpotifyPlayer.getPlaylists(), powercord.pluginManager.get('pc-spotify').getSpotifyLogo() ])
      .then(values => {
        this.setState({ playlists: values[0].items,
          spotifyImg: `data:image/png;base64, ${values[1]}` });
      });
  }

  render () {
    const { playlists } = this.state;
    const playlistList = [];
    playlists.forEach(playlist => {
      if (playlist.owner.display_name === powercord.account.spotify || playlist.collaborative) {
        playlistList.push(<Playlist className='powercord-spotify-playlist' spotifyImg={this.state.spotifyImg} item={playlist}/>);
      }
    });
    return (
      <Modal size={Modal.Sizes.MEDIUM}>
        <Modal.Header>
          <FormTitle tag='h4'>Add to Playlist</FormTitle>
          <Modal.CloseButton onClick={() => closeModal()}/>
        </Modal.Header>
        <Modal.Content>
          <FormTitle style={{ marginTop: '16px' }}>Available playlists</FormTitle>
          <div className='powercord-spotify-playlist-group'>
            {playlistList}
          </div>
        </Modal.Content>
      </Modal>
    );
  }
};
