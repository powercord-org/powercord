/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, Router } = require('powercord/webpack');
const StoreListing = require('./StoreListing');
const Suggestions = require('./Suggestions');
const Publish = require('./Publish');
const Verification = require('./Verification');
const Hosting = require('./Hosting');

module.exports = function () {
  // dont touch mah stuff :angery:
  const ids = [
    'fC7oUOUEEi4', 'h6DNdop6pD8', 'LDU_Txk06tM', 'Gc2u6AFImn8', 'Nl_Tj82asR4', '7Zm1hPbmzPw', 'qnydFmqHuVo',
    'ull5YaEHvw0', 'Yuc2dkr8d-A', 'L_jWHffIx5E', 'q4OItmKWFKw', 'NHEaYbDWyQE', 'eEa3vDXatXg', 'TwIvUbOhcKE'
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
        <Publish/>
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/verificaton' exact>
        <Verification/>
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/hosting' exact>
        <Hosting/>
      </Router.Route>
      <Router.Route path='/_powercord/store' exact>
        <Router.Redirect path='/_powercord/store/plugins'/>
      </Router.Route>
    </Router.Switch>
  );
};
