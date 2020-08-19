/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, Router } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
// eslint-disable-next-line no-unused-vars
const { get } = require('powercord/http');

const StoreListing = require('./StoreListing');
const Suggestions = require('./Suggestions');
const Publish = require('./Publish');
const Verification = require('./Verification');
const Hosting = require('./Hosting');
const Banned = require('./Banned');

module.exports = function () {
  // dont touch mah stuff :angery:
  const ids = [
    'fC7oUOUEEi4', 'h6DNdop6pD8', 'LDU_Txk06tM', 'Gc2u6AFImn8', 'Nl_Tj82asR4', '7Zm1hPbmzPw', 'qnydFmqHuVo',
    'ull5YaEHvw0', 'Yuc2dkr8d-A', 'L_jWHffIx5E', 'q4OItmKWFKw', 'NHEaYbDWyQE', 'eEa3vDXatXg', 'TwIvUbOhcKE',
    'jhExvE5fvJw', 'oT3mCybbhf0', 'woe2tvl2caw', 'LJxxHDTz8J4', 'ohBQ59OXnYM', '8qMs7mfRm-k', 'w0AOGeqOnFY',
    'npjF032TDDQ', 'QH2-TGUlwu4', 'Ct6BUPvE2sM', 'ZyhrYis509A', 'PDJLvF1dUek', 'Wl959QnD3lM', 'GegN_AXWWqc'
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'calc(100% + 240px)',
      height: '100%',
      marginLeft: -240,
      zIndex: 666
    }}>
      <iframe
        width='100%' height='100%'
        src={`https://www.youtube.com/embed/${ids[Math.floor(Math.random() * ids.length)]}?autoplay=1`}
        frameBorder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  );

  /* eslint-disable */
  const [ eligibility, setEligibility ] = React.useState(null)
  React.useEffect(() => {
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    // get(`${baseUrl}/api/v2/store/forms/eligibility`).then(res => res.ok && setEligibility(res.body))
  }, [])

  return (
    <Router.Switch>
      <Router.Route path='/_powercord/store/plugins' exact>
        <StoreListing type='plugins'/>
      </Router.Route>
      <Router.Route path='/_powercord/store/themes' exact>
        <StoreListing type='themes'/>
      </Router.Route>
      <Router.Route path='/_powercord/store/suggestions' exact>
        <Suggestions/>
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/publish' exact>
        {eligibility && !eligibility.publish ? <Banned/> : <Publish/>}
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/verificaton' exact>
        {eligibility && !eligibility.verificaton ? <Banned/> : <Verification/>}
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/hosting' exact>
        {eligibility && !eligibility.hosting ? <Banned/> : <Hosting/>}
      </Router.Route>
      <Router.Route path='/_powercord/store' exact>
        <Router.Redirect path='/_powercord/store/plugins'/>
      </Router.Route>
    </Router.Switch>
  );
};
