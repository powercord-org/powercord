const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

const Header = require('./Header');

module.exports = class DonateModal extends React.PureComponent {
  render () {
    return <Modal className='powercord-text powercord-donate-modal'>
      <Header/>
      <Modal.Content>
        <h3 className='powercord-donate-title'>Support Powercord's Development</h3>
        <h4 className='powercord-donate-subtitle'>And get sweet perks</h4>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/396521773115637780.png' alt='Tier 1'/>
          <div className='details'>
            <span className='price'>$1<sup>/month</sup></span>
            <span className='perk'>Customize your badges color</span>
          </div>
        </div>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/580597913512574976.png' alt='Tier 2'/>
          <div className='details'>
            <span className='price'>$5<sup>/month</sup></span>
            <span className='perk'>Get a custom badge on your profile</span>
          </div>
        </div>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/583258319150645248.png' alt='Tier 3'/>
          <div className='details'>
            <span className='price'>$10<sup>/month</sup></span>
            <span className='perk'>Get a custom badge for one of your servers</span>
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <a href='https://patreon.com/aetheryx' target='_blank'>
          <Button onClick={() => closeModal()}>Donate</Button>
        </a>
        <Button onClick={() => closeModal()} look={Button.Looks.LINK} color={Button.Colors.TRANSPARENT}>Nevermind</Button>
      </Modal.Footer>
    </Modal>;
  }
};
