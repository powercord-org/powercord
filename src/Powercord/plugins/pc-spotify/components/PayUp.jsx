const { React, getModule, constants: { SpotifyEndpoints }, i18n: { Messages } } = require('powercord/webpack');
const { FormTitle, Button } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

module.exports = React.memo(
  () => {
    const { size16 } = getModule([ 'size16' ], false);
    const { marginBottom20 } = getModule([ 'marginBottom20' ], false);

    return (
      <Modal className='powercord-text'>
        <Modal.Header>
          <FormTitle tag='h4'>Spotify Premium Required</FormTitle>
          <Modal.CloseButton onClick={() => closeModal()}/>
        </Modal.Header>
        <Modal.Content>
          <div className={`${size16} ${marginBottom20}`}>
            To control your Spotify playback we use Spotify's "Connect Web" API, which is unfortunately locked to
            Spotify Premium users. In order for you to control Spotify's playback you'll need to get a Premium
            subscription.
          </div>
          <div className={`${size16} ${marginBottom20}`}>
            If you do happen to have a Spotify Premium subscription but you're still not seeing the buttons show up,
            it might happen that Spotify is reporting inaccurate data about your Premium status and alters the
            availability of the buttons. Try changing the playback in any way (play, pause, change track, ...) to
            trigger and update and let us get accurate data from Spotify.
          </div>
          <div className={`${size16} ${marginBottom20}`}>
            If this still did not fix it, make sure you're not in a private session as we've received a few reports
            saying this causes your Premium subscription status to not be properly sent to us. Also make sure you do
            have your Spotify account linked to your Discord account (You can tell Discord to not show it on your
            profile and not show the song you're listening to in your status, if you don't want to)
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button onClick={() => window.open(SpotifyEndpoints.PREMIUM_SITE)}>
            {Messages.SPOTIFY_PREMIUM_UPGRADE_BUTTON}
          </Button>
          <Button onClick={() => closeModal()} look={Button.Looks.LINK} color={Button.Colors.TRANSPARENT}>
            {Messages.PREMIUM_DOWNGRADE_DONE_BUTTON}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
);
