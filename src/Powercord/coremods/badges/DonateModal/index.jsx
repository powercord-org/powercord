const { React, i18n: { Messages } } = require('powercord/webpack');
const { Button } = require('powercord/components');
const { Modal } = require('powercord/components/modal');
const { close: closeModal } = require('powercord/modal');

const Header = require('./Header');

module.exports = class DonateModal extends React.PureComponent {
  constructor () {
    super();
    this.state = {
      easterEgg: Math.floor(Math.random() * 100) === 69
    };
  }

  render () {
    return <Modal className='powercord-text powercord-donate-modal'>
      <Header/>
      <Modal.Content>
        <h3 className='powercord-donate-title'>{Messages.POWERCORD_CUTIE_TITLE}</h3>
        <h4 className='powercord-donate-subtitle'>{Messages.POWERCORD_CUTIE_SUBTITLE}</h4>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/396521773115637780.png' alt='Tier 1'/>
          <div className='details'>
            <span className='price'>{Messages.POWERCORD_CUTIE_TIER_1_PRICE.format()}</span>
            <span className='perk'>{Messages.POWERCORD_CUTIE_TIER_1_DESC.format()}</span>
          </div>
        </div>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/580597913512574976.png' alt='Tier 2'/>
          <div className='details'>
            <span className='price'>{Messages.POWERCORD_CUTIE_TIER_2_PRICE.format()}</span>
            <span className='perk'>{Messages.POWERCORD_CUTIE_TIER_2_DESC.format()}</span>
          </div>
        </div>
        <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/583258319150645248.png' alt='Tier 3'/>
          <div className='details'>
            <span className='price'>{Messages.POWERCORD_CUTIE_TIER_3_PRICE.format()}</span>
            <span className='perk'>{Messages.POWERCORD_CUTIE_TIER_3_DESC.format()}</span>
          </div>
        </div>
        {this.state.easterEgg && <div className='powercord-donate-tier'>
          <img className='icon' src='https://cdn.discordapp.com/emojis/404298286699249664.png' alt='Tier Infinite'/>
          <div className='details'>
            <span className='price'>{Messages.POWERCORD_CUTIE_TIER_EASTER_PRICE.format()}</span>
            <span className='perk'>{Messages.POWERCORD_CUTIE_TIER_EASTER_DESC.format()}</span>
          </div>
        </div>}
      </Modal.Content>
      <Modal.Footer>
        <a href='https://patreon.com/aetheryx' target='_blank'>
          <Button onClick={() => closeModal()}>{Messages.POWERCORD_CUTIE_DONATE}</Button>
        </a>
        <Button
          onClick={() => closeModal()} look={Button.Looks.LINK}
          color={Button.Colors.TRANSPARENT}
        >
          {Messages.USER_ACTIVITY_NEVER_MIND}
        </Button>
      </Modal.Footer>
    </Modal>;
  }
};
