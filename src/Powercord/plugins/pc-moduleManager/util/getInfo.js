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
  if (typeCache.has(identifier)) {
    return typeCache.get(identifier);
  }


  const isPlugin = get(`https://github.com/${identifier}/raw/HEAD/manifest.json`).then((r) => {
    if (r?.statusCode === 302) {
      return 'plugin';
    }
    throw null;
  }).catch(() => null);

  const isTheme = get(`https://github.com/${identifier}/raw/HEAD/powercord_manifest.json`).then((r) => {
    if (r?.statusCode === 302) {
      return 'theme';
    }
    throw null;
  }).catch(() => null);

  // Wait for either promise to resolve
  // If neither resolves, use null.

  // @ts-ignore
  const type = await Promise.any([ isPlugin, isTheme ]).catch(() => null);

  typeCache.set(identifier, type);
  return type;
}

/**
 * Check if a URL is a plugin or theme repository
 * @param {string} url The URL to check
 * @returns {Promise<PluginInfo|null>}
 */
module.exports = async function getRepoInfo (url) {
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
  const type = await getRepoType(identifier);
  if (!type) {
    return null;
  }

  // @ts-ignore
  const isInstalled = type === 'plugin' ? powercord.pluginManager.isInstalled(repoName) : powercord.styleManager.isInstalled(repoName);

  return {
    username,
    repoName,
    type,
    isInstalled
  };
};