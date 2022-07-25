// @ts-check

const { get } = require('powercord/http');

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
 * @param {string} identifier username/reponame
 * @returns {Promise<'plugin'|'theme'|null>} Whether the URL is a plugin or theme repository, or null if it's neither
 */
async function getRepoType (identifier) {
  const isTheme = await get(`https://github.com/${identifier}/raw/HEAD/powercord_manifest.json`).then((r) => {
    if (r?.statusCode === 302) {
      return 'theme';
    }
    return null;
  }).catch(() => null);


  const isPlugin = await get(`https://github.com/${identifier}/raw/HEAD/manifest.json`).then((r) => {
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
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return null;
  }

  const isGithub = parsedUrl.hostname.split('.').slice(-2).join('.') === 'github.com';
  const [ , username, repoName ] = parsedUrl.pathname.split('/');
  if (!isGithub || !username || !repoName) {
    return null;
  }
  const identifier = `${username}/${repoName}`;

  /**
   * @type {boolean}
   */
  // @ts-ignore
  const isInstalled = powercord.pluginManager.isInstalled(repoName) || powercord.styleManager.isInstalled(repoName);

  const data = {
    username,
    repoName,
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
