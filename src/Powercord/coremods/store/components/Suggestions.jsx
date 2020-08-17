/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React } = require('powercord/webpack');

const Layout = require('./layouts/PageLayout');

module.exports = React.memo(
  () => (
    <Layout
      catchLine='Get inspiration for your next plugin'
      subtext={'Browse all community-requested plugins and make people happier. It\'s free!'}
      placeholder='Explore suggestions'
    >

    </Layout>
  )
);
