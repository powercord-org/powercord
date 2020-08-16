/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { Clickable, AdvancedScrollerThin, Icons } = require('powercord/components');

const Item = React.memo(
  ({ path, icon, children }) => {
    const { useLocation } = getModule([ 'useLocation' ], false);
    const { transitionTo } = getModule([ 'transitionTo' ], false);
    const { categoryItem, selectedCategoryItem, innerItem } = getModule([ 'discoverHeader' ], false);
    const { container, selected: selectedClass, clickable, wrappedLayout, layout, avatar, content } = getModule([ 'wrappedLayout' ], false);

    const loc = useLocation();
    const fullPath = `/_powercord/store/${path}`;
    const selected = loc.pathname.startsWith(fullPath);

    return (
      <Clickable
        onClick={() => !selected && transitionTo(fullPath)}
        className={[ container, clickable, categoryItem, selected && `${selectedCategoryItem} ${selectedClass}` ].filter(Boolean).join(' ')}
      >
        <div className={`${layout} ${wrappedLayout} ${innerItem}`}>
          <div className={avatar}>
            {React.createElement(Icons[icon], {
              width: 24,
              height: 24
            })}
          </div>
          <div className={content}>{children}</div>
        </div>
      </Clickable>
    );
  }
);

module.exports = React.memo(
  () => {
    const { discoverHeader } = getModule([ 'discoverHeader' ], false);
    const sizes = getModule([ 'size24' ], false);

    return (
      <AdvancedScrollerThin className='powercord-text'>
        <h2 className={`${discoverHeader} ${sizes.size24}`}>Powercord Store</h2>
        <Item icon='Plugin' path='/plugins'>Plugins</Item>
        <Item icon='Theme' path='/themes'>Themes</Item>
        <Item icon='Bulb' path='/suggestions'>Suggestions</Item>

        <h3 className={`${discoverHeader} ${sizes.size20}`}>Get in touch</h3>
        <Item icon='CloudUpload' path='/forms/publish'>Publish a product</Item>
        <Item icon='Certificate' path='/forms/verificaton'>Get verified</Item>
        <Item icon='Server' path='/forms/hosting'>Host a backend</Item>
      </AdvancedScrollerThin>
    );
  }
);
