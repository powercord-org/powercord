/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { findInTree, getReactInstance } = require('powercord/util');
const { React, modal } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal');

module.exports = {
  /**
   * Opens a new modal
   * @param {React.Component|function(): React.Element} Component
   * @return {string} Modal ID
   */
  open: (Component) =>
    modal.openModal((p) =>
      React.createElement(Modal.ModalRoot, {
        ...p,
        className: 'powercord-fake-modal-container'
      }, React.createElement(Component))),

  /**
   * Closes the currently opened modal
   * @param {string} modal Modal ID
   */
  close: () => {
    const instance = getReactInstance(document.querySelector('[role=dialog]'));
    if (!instance) {
      return;
    }

    const props = findInTree(instance, (n) => n.modalKey, { walkable: [ 'memoizedProps', 'return' ] });
    if (!props) {
      return;
    }

    modal.closeModal(props.modalKey);
  },

  /**
   * Closes all modals
   */
  closeAll: () => {
    modal.closeAllModals();
  }
};
