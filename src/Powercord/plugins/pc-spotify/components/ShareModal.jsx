const { React, messages, channels } = require('powercord/webpack');
const { FormTitle, Text } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

class Track extends React.PureComponent {
  handleClick (item) {
    return messages.sendMessage(
      channels.getChannelId(),
      { content: item.external_urls.spotify }
    ).then(() => closeModal());
  }

  render () {
    const image = this.props.item.album.images[0]
      ? <img className='image' alt='cover' src={this.props.item.album.images[0].url} height='50' width='50' />
      : <img className='image' alt='cover' src={this.props.spotifyImg} height='50' />;
    return (
      <div className='powercord-spotify-playlist' onClick={() => this.handleClick(this.props.item)}>
        {image}
        <span className='name'>{this.props.item.name}</span>
      </div>
    );
  }
}

module.exports = class ShareModal extends React.PureComponent {
  constructor () {
    super();

    this.state = {
      tracks: [],
      spotifyImg: ''
    };
  }

  componentDidMount () {
    Promise.all([ this.props.tracks, powercord.pluginManager.get('pc-spotify').getSpotifyLogo() ])
      .then(values => {
        this.setState({
          tracks: values[0].items,
          spotifyImg: `data:image/png;base64, ${values[1]}`
        });
      });
  }

  render () {
    const { tracks } = this.state;
    const trackList = [];
    tracks.forEach(track => {
      trackList.push(<Track className='powercord-spotify-playlist' spotifyImg={this.state.spotifyImg} item={track}/>);
    });
    return (
      <Modal size={Modal.Sizes.MEDIUM}>
        <Modal.Header>
          <FormTitle tag='h4'>Multiple tracks found - "{this.props.query}"</FormTitle>
          <Modal.CloseButton onClick={() => closeModal()}/>
        </Modal.Header>
        <Modal.Content>
          <Text color={Text.Colors.PRIMARY} size={Text.Sizes.MEDIUM}>
            Please select the track that you wish to share to the current channel.
          </Text>
          <FormTitle style={{ marginTop: '16px' }}>Available tracks</FormTitle>
          <div className='powercord-spotify-playlist-group'>
            {trackList}
          </div>
        </Modal.Content>
      </Modal>
    );
  }
};
