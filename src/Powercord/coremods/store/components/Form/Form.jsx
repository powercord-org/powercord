/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');

module.exports = React.memo(
  ({ renderer, testCallback }) => (
    <>
      {renderer()}
      <Button onClick={testCallback}>test</Button>
    </>
  )
);
