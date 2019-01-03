module.exports = class SettingsManager {
  constructor (category) {
    if (!category) {
      throw new TypeError('Missing SettingsManager category name');
    }

    this.category = category.startsWith('pc-') ? category : `pc-${category}`;
    this.config = this._readFromLS();
  }

  _readFromLS () {
    const entry = localStorage.getItem(this.category);
    try {
      return JSON.parse(entry) || {};
    } catch (_) {
      return {};
    }
  }

  get (nodePath, defaultValue) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      currentNode = currentNode[fragment];
    }

    return (currentNode === void 0 || currentNode === null)
      ? defaultValue
      : currentNode;
  }

  set (nodePath, value) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      if (nodePaths.indexOf(fragment) === nodePaths.length - 1) {
        currentNode[fragment] = value;
      } else if (!currentNode[fragment]) {
        currentNode[fragment] = {};
      }

      currentNode = currentNode[fragment];
    }

    this._save();
  }

  _save () {
    localStorage.setItem(this.category, JSON.stringify(this.config));
  }
};
