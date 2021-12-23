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
          <FormTitle tag='h4'>{Messages.SPOTIFY_PAYUP_TITLE}</FormTitle>
          <Modal.CloseButton onClick={() => closeModal()}/>
        </Modal.Header>
        <Modal.Content>
          <div className={`${size16} ${marginBottom20}`}>
            {Messages.SPOTIFY_PAYUP_TEXT_1}
          </div>
          <div className={`${size16} ${marginBottom20}`}>
            {Messages.SPOTIFY_PAYUP_TEXT_2}
          </div>
          <div className={`${size16} ${marginBottom20}`}>
            {Messages.SPOTIFY_PAYUP_TEXT_3}
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
