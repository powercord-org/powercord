// @ts-check

const { get } = require('powercord/http');
const { REPO_URL_REGEX } = require('./misc');

/**
 * @type Map<string, 'plugin'|'theme'|null>
 */
const typeCache = new Map();

/**
 * @typedef PluginInfo
 * @property {string} username
 * @property {string} repoName
 * @property {'plugin'|'theme'} type Whether the URL is a plugin or theme repository
 * @property {boolean} isInstalled Whether the plugin/theme is installed
 */

/**
 *
 * @param {string} identifier username/reponame/branch (branch is optional)
 * @returns {Promise<'plugin'|'theme'|null>} Whether the URL is a plugin or theme repository, or null if it's neither
 */
async function getRepoType (identifier) {
  const [ username, repoName, branch ] = identifier.split('/');
  const isTheme = await get(`https://github.com/${username}/${repoName}/raw/${branch || 'HEAD'}/powercord_manifest.json`).then((r) => {
    if (r?.statusCode === 302) {
      return 'theme';
    }
    return null;
  }).catch(() => null);

  const isPlugin = await get(`https://github.com/${username}/${repoName}/raw/${branch || 'HEAD'}/manifest.json`).then((r) => {
    if (r?.statusCode === 302) {
      return 'plugin';
    }
    return null;
  }).catch(() => null);
  // Wait for either promise to resolve
  // If neither resolves, use null.

  // @ts-ignore
  const type = isTheme || isPlugin || null;

  typeCache.set(identifier, type);
  return type;
}

/**
 * Check if a URL is a plugin or theme repository
 * @param {string} url The URL to check
 * @returns {PluginInfo|Promise<PluginInfo|null>}
 */
module.exports = function getRepoInfo (url) {
  const urlMatch = url.match(REPO_URL_REGEX);
  if (!urlMatch) {
    return null;
  }
  const [ , username, repoName, branch ] = urlMatch;

  const identifier = `${username}/${repoName}/${branch || ''}`;

  /**
   * @type {boolean}
   */
  // @ts-ignore
  const isInstalled = powercord.pluginManager.isInstalled(repoName) || powercord.styleManager.isInstalled(repoName);

  const data = {
    username,
    repoName,
    branch,
    isInstalled
  };

  if (typeCache.has(identifier)) {
    const type = typeCache.get(identifier);
    if (!type) {
      return null;
    }
    return {
      ...data,
      type
    };
  }

  return getRepoType(identifier).then(type => {
    if (!type) {
      return null;
    }
    return {
      ...data,
      type
    };
  });
};
