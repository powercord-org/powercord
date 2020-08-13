/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

/* eslint-disable */

/**
 * bowoser's notes:
 *
 * The extension gets successfully loaded, however it seems like
 * the devtools tabs doesn't want to. it *seems* related to a
 * chromium issue but i'm really unsure. might need further
 * investigation ig
 *
 * https://github.com/electron/electron/issues/23662
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1093731
 */

const { existsSync, promises: { mkdir, writeFile } } = require('fs');
const { join } = require('path');
const unzip = require('unzip-crx');
const { get } = require('powercord/http');
const { rmdirRf } = require('powercord/util');

const CRX_URL = 'https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=83.0.4103.103&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc';
const EXT_PATH = join(__dirname, 'ext');
const RDT_PATH = join(EXT_PATH, 'rdt');

async function download () {
  const crxRes = await get(CRX_URL);
  const url = crxRes.headers.location;
  const extFile = join(EXT_PATH, url.split('/').pop());
  if (existsSync(EXT_PATH)) {
    if (existsSync(extFile)) {
      // Everything's up to date
      return;
    }
    await rmdirRf(EXT_PATH);
  }
  await mkdir(EXT_PATH);
  const res = await get(url);
  await writeFile(extFile, res.raw);
  return unzip(extFile, RDT_PATH);
}

let id;
module.exports = () => {
  return () => void 0;
  // download().then(() => PowercordNative.installExtension(RDT_PATH)).then(eid => id = eid);
  // return () => id && PowercordNative.uninstallExtension(id);
};
