const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');
const { Modal } = require('powercord/components/modal');

const Header = require('./Header');

module.exports = class DonateModal extends React.PureComponent {
  render () {
    return <Modal
      className='powercord-text powercord-donate-modal'
      _pass={{ ref: s => setImmediate(() => s && s.getScroller() && s.getScroller().scrollTo(0)) }}
    >
      <Header/>
      <Modal.Content>
        <h3 className='powercord-donate-title'>Support Powercord's Development</h3>
        <h4 className='powercord-donate-subtitle'>And get sweet perks</h4>
      </Modal.Content>
      <Modal.Footer>
        <Button>Yes?</Button>
      </Modal.Footer>
    </Modal>;
  }
};

