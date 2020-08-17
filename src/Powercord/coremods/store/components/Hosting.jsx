/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React } = require('powercord/webpack');

const Layout = require('./layouts/FormLayout');

module.exports = React.memo(
  () => (
    <Layout icon='Server' title='Host a backend'>

    </Layout>
  )
);
