/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React } = require('powercord/webpack');

const Layout = require('./layouts/PageLayout');

module.exports = React.memo(
  ({ type }) => (
    <Layout catchLine={`Find some neat ${type} to spice up your experience`} placeholder={`Search ${type}`}>

    </Layout>
  )
);
