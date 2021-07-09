/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');

const COUNTS = [ [ 1696, 20 ], [ 1432, 16 ], [ 1168, 12 ], [ 0, 8 ] ]; // yoinked from Discord's source code
module.exports = React.memo(
  ({ loading, children }) => {
    const { guildList } = getModule([ 'guildList', 'guildListSection' ], false);
    const { cardPlaceholder } = getModule([ 'card', 'guildBadge' ], false);

    const [ placeholderCount, setPlaceholderCount ] = React.useState(0);
    const setCount = React.useCallback(() => setPlaceholderCount(COUNTS.find(c => window.innerWidth >= c[0])[1]), []);
    React.useEffect(() => setCount(), []);
    React.useEffect(() => {
      window.addEventListener('resize', setCount);
      return () => window.removeEventListener('resize', setCount);
    }, [ setCount ]);

    return (
      <div className={guildList}>
        {loading
          ? Array(placeholderCount).fill(<div className={cardPlaceholder}/>)
          : children}
      </div>
    );
  }
);
