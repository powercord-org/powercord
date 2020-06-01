const { React, Flux, i18n: { Messages } } = require('powercord/webpack');
const { FormTitle, Button, Divider, Spinner, Card, Tooltip } = require('powercord/components');
const { Modal, Confirm } = require('powercord/components/modal');
const { open: openModal, close: closeModal } = require('powercord/modal');

const { SPOTIFY_DEFAULT_IMAGE } = require('../constants');
const songsStore = require('../songsStore/store');
const songsStoreActions = require('../songsStore/actions');
const SpotifyAPI = require('../SpotifyAPI');

class AddToPlaylist extends React.PureComponent {
  componentDidMount () {
    if (!this.props.loaded) {
      songsStoreActions.loadPlaylists();
    }
  }

  render () {
    return (
      <Modal className='powercord-text spotify-add-to-playlist' size={Modal.Sizes.MEDIUM}>
        <Modal.Header>
          <FormTitle tag='h4'>Add to Playlist</FormTitle>
          <Modal.CloseButton onClick={() => closeModal()}/>
        </Modal.Header>
        <Modal.Content>
          <p>Where do you want to save this very nice tune?</p>
          <div className='track'>
            <img src={this.props.track.cover || SPOTIFY_DEFAULT_IMAGE} alt='Spotify Cover'/>
            <div className='details'>
              <span className='title'>
                {this.props.track.name}
              </span>
              <span className='sub'>
                {Messages.USER_ACTIVITY_LISTENING_ARTISTS.format({
                  artists: this.props.track.artists,
                  artistsHook: t => t
                })}
              </span>
            </div>
          </div>
          <Divider/>
          <div className='playlists'>
            {!this.props.loaded
              ? <Spinner/>
              : Object.keys(this.props.playlists).map(p => this.renderItem(p))}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button onClick={() => closeModal()} look={Button.Looks.LINK} color={Button.Colors.TRANSPARENT}>
            {Messages.USER_ACTIVITY_NEVER_MIND}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderItem (playlistId) {
    const playlist = this.props.playlists[playlistId];
    if (!playlist.editable) {
      return null;
    }

    return (
      <Card className='playlist' key={playlistId}>
        <img src={playlist.icon || SPOTIFY_DEFAULT_IMAGE} alt='Spotify Cover'/>
        <div className='details'>
          <span className='title'>
            {playlist.name}
          </span>
          <span className='sub'>
            {playlist.tracksLoaded
              ? `${Object.keys(playlist.tracks).length} tracks`
              : Messages.DEFAULT_INPUT_PLACEHOLDER}
          </span>
        </div>
        {playlist.tracksLoaded
          ? (
            <Button onClick={() => this.handleAddToPlaylist(playlistId)}>
              Add to Playlist
            </Button>
          )
          : (
            <Tooltip text='Please wait for the playlist to load'>
              <Button disabled>Add to Playlist</Button>
            </Tooltip>
          )}
      </Card>
    );
  }

  handleAddToPlaylist (playlistId) {
    closeModal();
    const playlist = this.props.playlists[playlistId];
    if (playlist.tracks[this.props.track.id]) {
      openModal(() => (
        <Confirm
          header='Duplicate detected'
          confirmText='Add anyway'
          cancelText={Messages.USER_ACTIVITY_NEVER_MIND}
          onConfirm={() => {
            SpotifyAPI.addToPlaylist(playlistId, this.props.track.uri);
            closeModal();
          }}
          onCancel={closeModal}
        >
          <div className='powercord-text'>
            This item is already in this playlist. Do you want to add it anyway?
          </div>
        </Confirm>
      ));
    } else {
      SpotifyAPI.addToPlaylist(playlistId, this.props.track.uri);
    }
    console.log(playlistId, this.props.playlists[playlistId]);
  }
}

module.exports = Flux.connectStores(
  [ songsStore ],
  () => ({
    loaded: songsStore.getPlaylistsLoaded(),
    playlists: songsStore.getPlaylists()
  })
)(AddToPlaylist);
