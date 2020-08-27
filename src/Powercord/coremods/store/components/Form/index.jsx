/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AdvancedScrollerAuto, Icons, AsyncComponent } = require('powercord/components');

const Closed = require('./Closed');
const Intro = require('./Intro');
const Form = require('./Form');
const Success = require('./Success');

const Sequencer = AsyncComponent.from(getModuleByDisplayName('Sequencer'));

module.exports = React.memo(
  ({ icon, title, eligibility, renderIntro, renderForm }) => {
    const { base } = getModule([ 'base' ], false);
    const { size32 } = getModule([ 'size24' ], false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { scroller } = getModule([ 'headerContentWrapper' ], false);
    const { wrappedLayout, layout, avatar, content } = getModule([ 'wrappedLayout' ], false);

    const [ step, setStep ] = React.useState(0);

    if (eligibility && eligibility !== 'OK') {
      if (eligibility === 'BANNED') {
        return <Closed.Banned/>;
      }
      return <Closed.Unavailable/>;
    }

    return (
      <div className={`powercord-store ${pageWrapper}`}>
        <AdvancedScrollerAuto className={scroller}>
          <h2 className={`${size32} ${base} ${layout} ${wrappedLayout}`}>
            <div className={avatar}>
              {React.createElement(Icons[icon], {
                width: 32,
                height: 32
              })}
            </div>
            <div className={content}>{title}</div>
          </h2>
          <Sequencer step={step} steps={[ 0, 1, 2 ]} className='powercord-store-form'>
            {step === 0
              ? <Intro renderer={renderIntro} onClick={() => setStep(1)}/>
              : step === 1
                ? <Form error={null} renderer={renderForm} testCallback={() => setStep(2)}/>
                : <Success/>}
          </Sequencer>
        </AdvancedScrollerAuto>
      </div>
    );
  }
);
