/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Clickable, Button, AdvancedScrollerAuto, Icon } = require('powercord/components');

const SearchBar = React.memo(
  ({ placeholder, onSearch }) => {
    const { size12 } = getModule([ 'size12' ], false);
    const { colorMuted } = getModule([ 'colorMuted' ], false);
    const { inputWrapper, inputDefault } = getModule([ 'inputWrapper' ], false);
    const mdl1 = getModule([ 'searchBoxInputWrapper' ], false);
    const mdl2 = getModule([ 'searchBox', 'search' ], false);

    const [ value, setValue ] = React.useState('');
    const [ focused, setFocused ] = React.useState(false);

    return (
      <div className={mdl2.container}>
        <div className={mdl2.search}>
          <div className={`${mdl1.searchBox} ${mdl2.searchBox}`}>
            <div className={`${inputWrapper} ${mdl1.searchBoxInputWrapper}`}>
              <input
                type='text'
                name='search'
                value={value}
                maxLength={100}
                autoComplete='off'
                placeholder={placeholder}
                className={`${inputDefault} ${mdl1.searchBoxInput} ${mdl2.searchBoxInput}`}
                onKeyPress={e => e.which === 13 && onSearch(value) | e.target.blur()}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
            {value.length > 1 && focused && <div className={`${mdl1.cta} ${size12} ${colorMuted}`}>
              {Messages.GUILD_DISCOVERY_SEARCH_ENTER_CTA}
            </div>}
            {value.length > 0
              ? <Clickable className={mdl1.clear} onClick={() => setValue('') | onSearch(null)}>
                <Icon name='CloseCircle' className={`${mdl1.clearIcon} ${mdl2.closeIcon}`} width={24} height={24}/>
              </Clickable>
              : <Icon name='Search' className={`${mdl1.searchIcon} ${mdl2.searchIcon}`} width={24} height={24}/>}
          </div>
        </div>
      </div>
    );
  }
);

module.exports = React.memo(
  ({ catchLine, subtext, placeholder, onSearch, footerText, footerLink, footerAction, noFooter, children }) => {
    const { base } = getModule([ 'base' ], false);
    const { size24, size16 } = getModule([ 'size24' ], false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const {
      viewWrapper, scroller,
      headerImage, headerContentWrapper, headerContent,
      searchHeader, searchTitle, searchSubtitle,
      footer, footerImage
    } = getModule([ 'headerContentWrapper' ], false);

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
            {!noFooter && <div className={footer}>
              <img src='https://discord.com/assets/6429567e7cc7b7c04d1791a58d21795d.svg' alt='' className={footerImage}/>
              <h3 className={`${base} ${size16}`}>{footerText || 'You reached the bottom. Impressive!'}</h3>
              {footerAction &&
              <Button look={Button.Looks.LINK} color={Button.Colors.LINK} size={Button.Sizes.MIN} onClick={footerAction}>
                {footerLink}
              </Button>}
            </div>}
          </div>
        </AdvancedScrollerAuto>
      </div>
    );
  }
);
