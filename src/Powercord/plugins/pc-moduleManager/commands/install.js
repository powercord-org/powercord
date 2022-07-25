const { cloneRepo, getRepoInfo } = require('../util');
const Modal = require('../components/ConfirmModal');
const { React } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');

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

    openModal(() => React.createElement(Modal, {
      red: true,
      header: `Install ${info.type}`,
      desc: `Are you sure you want to install the ${info.type} ${info.repoName}?`,
      onConfirm: () => {
        cloneRepo(url, replugged, info.type);

        powercord.api.notices.sendToast(`PDPluginInstalling-${info.repoName}`, {
          header: `Installing ${info.repoName}...`,
          type: 'info',
          timeout: 10e3,
          buttons: [ {
            text: 'Got It',
            color: 'green',
            size: 'medium',
            look: 'outlined'
          } ]
        });
      },
      onCancel: () => closeModal()
    }));
  }
};

