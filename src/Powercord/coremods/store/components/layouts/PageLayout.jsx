/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { AdvancedScrollerAuto, Icons: { Search } } = require('powercord/components');

const SearchBar = React.memo(
  ({ placeholder }) => {
    const { inputWrapper, inputDefault } = getModule([ 'inputWrapper' ], false);
    const mdl1 = getModule([ 'searchBoxInputWrapper' ], false);
    const mdl2 = getModule([ 'searchBox', 'search' ], false);
    return (
      <div className={mdl2.container}>
        <div className={mdl2.search}>
          <div className={`${mdl1.searchBox} ${mdl2.searchBox}`}>
            <div className={`${inputWrapper},  ${mdl1.searchBoxInputWrapper}`}>
              <input
                type='text'
                name='search'
                maxLength={100}
                autoComplete='off'
                placeholder={placeholder}
                className={`${inputDefault} ${mdl1.searchBoxInput} ${mdl2.searchBoxInput}`}
              />
            </div>
            <Search className={`${mdl1.closeIcon} ${mdl2.closeIcon}`} width={24} height={24}/>
          </div>
        </div>
      </div>
    );
  }
);

module.exports = React.memo(
  ({ catchLine, subtext, placeholder, onSearch, children }) => {
    const { base } = getModule([ 'base' ], false);
    const { size24, size16 } = getModule([ 'size24' ], false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { viewWrapper, scroller, headerImage, headerContentWrapper, headerContent, searchHeader, searchTitle, searchSubtitle } = getModule([ 'headerContentWrapper' ], false);
    return (
      <div className={`powercord-store ${pageWrapper}`}>
        <AdvancedScrollerAuto className={scroller}>
          <div className={viewWrapper}>
            <div className={searchHeader}>
              <img src='https://discord.com/assets/3e0acf6d69894a5d20deb7c513cd1412.svg' alt='' className={headerImage}/>
              <div className={headerContentWrapper}>
                <div className={headerContent}>
                  <h3 className={`${searchTitle} ${size24} ${base}`}>{catchLine}</h3>
                  {subtext && <div className={`${searchSubtitle} ${size16}`}>{subtext}</div>}
                  <SearchBar placeholder={placeholder} onSearch={onSearch}/>
                </div>
              </div>
            </div>
            {children}
          </div>
        </AdvancedScrollerAuto>
      </div>
    );
  }
);
