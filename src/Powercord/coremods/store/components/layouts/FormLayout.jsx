/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { AdvancedScrollerAuto, Icons } = require('powercord/components');

module.exports = React.memo(
  ({ icon, title, children }) => {
    const { base } = getModule([ 'base' ], false);
    const { size32 } = getModule([ 'size24' ], false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { scroller } = getModule([ 'headerContentWrapper' ], false);
    const { wrappedLayout, layout, avatar, content } = getModule([ 'wrappedLayout' ], false);

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
          {children}
        </AdvancedScrollerAuto>
      </div>
    );
  }
);
