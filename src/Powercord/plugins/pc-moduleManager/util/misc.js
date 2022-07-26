exports.REPO_URL_REGEX = /https?:\/\/(?:www\.)?github\.com\/([^/\s>]+)\/([^/\s>]+)(?:\/tree\/([^\s>]+))?/;

exports.resp = (success, description) => ({
  send: false,
  result: {
    type: 'rich',
    color: success ? 0x1bbb1b : 0xdd2d2d,
    title: success ? 'Success' : 'Error',
    description
  }
});
