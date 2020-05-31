const { API } = require('powercord/entities');

/**
 * @typedef PowercordToast
 * @property {String} header
 * @property {String} content
 * @property {ToastButton[]|void} buttons
 * @property {Number|void} timeout
 * @property {String|void} className
 * @property {Boolean|void} hideProgressBar
 */

/**
 * @typedef ToastButton
 * @property {String|void} size
 * @property {String|void} look
 * @property {String|void} color
 * @property {function} onClick
 * @property {String} text
 */

/**
 * @typedef PowercordAnnouncement
 * @property {String} message
 * @property {String|void} color
 * @property {function|void} onClose
 * @property {Object|void} button
 * @property {function} button.onClick
 * @property {String} button.text
 */

/**
 * @property {Object.<String, PowercordToast>} toasts
 * @property {Object.<String, PowercordAnnouncement>} announcements
 */
module.exports = class NoticesAPI extends API {
  constructor () {
    super();

    this.announcements = {};
    this.toasts = {};
  }

  /**
   * Sends an announcement to the user (banner at the top of the client)
   * @param {String} id Announcement ID
   * @param {PowercordAnnouncement} props Announcement
   * @emits NoticesAPI#announcementAdded
   */
  sendAnnouncement (id, props) {
    if (this.announcements[id]) {
      return this.error(`ID ${id} is already used by another plugin!`);
    }

    this.announcements[id] = props;
    this.emit('announcementAdded', id);
  }

  /**
   * Closes an announcement
   * @param {String} id Announcement ID
   * @emits NoticesAPI#announcementClosed
   */
  closeAnnouncement (id) {
    if (!this.announcements[id]) {
      return;
    }

    delete this.announcements[id];
    this.emit('announcementClosed', id);
  }

  /**
   * Sends a toast to the user
   * @param {String} id Toast ID
   * @param {PowercordToast} props Toast
   * @emits NoticesAPI#toastAdded
   */
  sendToast (id, props) {
    if (this.toasts[id]) {
      return this.error(`ID ${id} is already used by another plugin!`);
    }

    this.toasts[id] = props;
    this.emit('toastAdded', id);
  }

  /**
   * Closes a toast
   * @param {String} id Toast ID
   * @emits NoticesAPI#toastLeaving
   */
  closeToast (id) {
    const toast = this.toasts[id];
    if (!toast) {
      return;
    }

    if (toast.callback && typeof toast.callback === 'function') {
      toast.callback();
    }

    this.emit('toastLeaving', id);
    setTimeout(() => delete this.toasts[id], 500);
  }
};
