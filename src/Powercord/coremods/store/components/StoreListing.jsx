const { React } = require('powercord/webpack');

const Layout = require('./StoreWrapper');

module.exports = React.memo(
  ({ type }) => (
    <Layout catchLine={`Find some neat ${type} to spice up your experience`} placeholder={`Search ${type}`}>

    </Layout>
  )
);
