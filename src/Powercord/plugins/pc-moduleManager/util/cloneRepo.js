const { join } = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { REPO_URL_REGEX } = require('./misc');

module.exports = async function download (url, powercord, type) {
  // const dir = type === 'plugin' ? join(__dirname, '..', '..') : join(__dirname, '..', '..', 'themes');
  let dir;
  switch (type) {
    case 'plugin':
      dir = join(__dirname, '..', '..');
      break;
    case 'theme':
      dir = join(__dirname, '..', '..', '..', 'themes');
      break;
  }

  const urlMatch = url.match(REPO_URL_REGEX);
  if (!urlMatch) {
    console.error(`Could not parse URL: ${url}`);
    return;
  }
  const [ , username, repoName, branch ] = urlMatch;
  const args = [ 'clone', `https://github.com/${username}/${repoName}.git` ];
  if (branch) {
    args.push('--branch', branch);
  }
  let c;

  try {
    c = spawn('git', args, {
      cwd: dir,
      windowsHide: true
    });
  } catch (err) {
    console.error('Could not install plugin', err);
  }

  c.stdout.on('data', (data) => console.log(data.toString()));
  c.stderr.on('data', (data) => {
    data = data.toString();
    console.log(data);

    if (data.includes('already exists')) {
      powercord.api.notices.sendToast(`PDAlreadyInstalled-${repoName}`, {
        header: 'Plugin Already Installed',
        content: `${repoName} is already installed.`,
        type: 'info',
        timeout: 10e3,
        buttons: [ {
          text: 'Got It',
          color: 'green',
          size: 'medium',
          look: 'outlined'
        } ]
      });
    }
  });

  c.on('exit', async (code) => {
    if (code === 0) {
      let files;
      try {
        files = fs.readdirSync(join(dir, repoName));
      } catch (e) {
        console.log('could not do it');
        console.error(e);
      }

      if (files.includes('powercord_manifest.json') || files.includes('manifest.json')) {
        powercord.api.notices.closeToast(`PDPluginInstalling-${repoName}`);
        if (type === 'plugin') {
          await powercord.pluginManager.remount(repoName);
          if (powercord.pluginManager.plugins.has(repoName)) {
            powercord.api.notices.sendToast(`PDPluginInstalled-${repoName}`, {
              header: 'Plugin Installed',
              content: `${repoName} installed`,
              type: 'info',
              timeout: 10e3,
              buttons: [ {
                text: 'Got It',
                color: 'green',
                size: 'medium',
                look: 'outlined'
              } ]
            });
          } else {
            // handle this error somehow
          }
        } else if (type === 'theme') {
          await powercord.styleManager.loadThemes();
          if (powercord.styleManager.themes.has(repoName)) {
            powercord.api.notices.sendToast(`PDPluginInstalled-${repoName}`, {
              header: 'Theme Installed',
              content: `${repoName} installed`,
              type: 'info',
              timeout: 10e3,
              buttons: [ {
                text: 'Got It',
                color: 'green',
                size: 'medium',
                look: 'outlined'
              } ]
            });
          } else {
            // also handle this error
          }
        }
      } else {
        powercord.api.notices.sendToast('PDNoManifest', {
          header: `This ${type} has no manifest, it may not be a ${type}`,
          content: `This ${type} has no manifest, it may not be a ${type}`,
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: 'Got It',
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      }
    }
  });
};
