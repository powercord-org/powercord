const { getRepoInfo } = require('../getinfo');
const cloneRepo = require('../util/cloneRepo');

module.exports = {
  command: 'install',
  description: 'Install a plugin or theme.',
  usage: '{c} [ plugin URL ]',
  async executor (args) {
    let url = args[0];
    if (url) {
      url = url.trim();
    }
    if (url?.match(/^[\w-]+\/[\w-.]+$/)) {
      url = `https://github.com/${url}`;
    }
    console.log(url);
    try {
      new URL(url);
    } catch (e) {
      return {
        send: false,
        result: 'Invalid URL! Please specify a valid GitHub URL or username/repository.'
      };
    }

    const info = await getRepoInfo(url);
    if (!info) {
      return {
        send: false,
        result: 'The requested plugin or theme could not be found or is invalid.'
      };
    }

    if (info.isInstalled) {
      return {
        send: false,
        result: `\`${info.repoName}\` is already installed!`
      };
    }

    cloneRepo(url, powercord, info.type);

    return {
      send: false,
      result: `Installing \`${info.repoName}\`...`
    };
  }
};

