/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { Flex } = require('powercord/components');

const Layout = require('./layouts/FormLayout');
const FormOrPoop = require('./FormOrPoop');

module.exports = React.memo(
  () => {
    const { weightMedium } = getModule([ 'weightMedium' ], false);
    const { size32, size24, size20, size16 } = getModule([ 'size24' ], false);
    const { marginBottom20, marginBottom8 } = getModule([ 'marginBottom20' ], false);
    return (
      <Layout icon='Verified' title='Get verified'>
        <p className={size16}>
          The Powercord Verification Program rewards plugin and theme developers for being part of what makes the
          Powercord ecosystem what it is today, by making outstanding products and keeping them up to date. Verified
          products have a very nice verified checkmark next to their name, as well as a dedicated category.
        </p>
        <h2 className={size32}>What do I need to get verified?</h2>
        <p className={`${size16} ${marginBottom20}`}>
          We want the verified checkmark to be a sign of quality. That's why for verified products we have an additional
          set of requirements your product must abide by to get the ultimate sign of quality.
        </p>
        <Flex className={marginBottom20}>
          <Flex.Child>
            <h3 className={`${size24} ${marginBottom20} ${weightMedium}`}>Plugins requirements</h3>
            <div className={marginBottom8}>
              <div className={size20}>Bring a noticeable feature</div>
              <div className={`${size16} ${marginBottom8}`}>Your plugin should bring a new and original feature, that stands out of the crowd.</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Follow all <a href='#'>Powercord's Best Practices</a></div>
              <div className={`${size16} ${marginBottom8}`}>Following those will ensure the users will have a smooth experience using your plugin.</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Be updated</div>
              <div className={`${size16} ${marginBottom8}`}>A plugin needs love and care. When it breaks, you should be nearby to pat it and fix it.</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Be nice</div>
              <div className={`${size16} ${marginBottom8}`}>We expect verified developers to be an example. So show the good example to the community!</div>
            </div>
          </Flex.Child>
          <Flex.Child>
            <h3 className={`${size24} ${marginBottom20} ${weightMedium}`}>Themes requirements</h3>
            <div className={marginBottom8}>
              <div className={size20}>Be unique, and complete</div>
              <div className={`${size16} ${marginBottom8}`}>Your theme should be original, and provide a really identifiable look to Discord. Be creative!</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Be customizable</div>
              <div className={`${size16} ${marginBottom8}`}>This one is not strictly required, but if your theme is configurable that's of course bonus points.</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Be updated</div>
              <div className={`${size16} ${marginBottom8}`}>A theme needs love and care. When Discord adds or updates their UIs, you should update your theme as well.</div>
            </div>
            <div className={marginBottom8}>
              <div className={size20}>Be nice</div>
              <div className={`${size16} ${marginBottom8}`}>We expect verified developers to be an example. So show the good example to the community!</div>
            </div>
          </Flex.Child>
        </Flex>
        <h2 className={`${size32} ${marginBottom20}`}>My product meets all the requirements!</h2>
        <FormOrPoop/>
      </Layout>
    );
  }
);
