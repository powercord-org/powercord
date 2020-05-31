/**
 * All credit goes to rauenzi (Zerebos#7790) for writing up this implementation.
 * You can find the original source here:
 * <https://github.com/rauenzi/BDPluginLibrary/blob/master/release/0PluginLibrary.plugin.js#L3302-L3336>
 */

module.exports = function findInTree (tree, filter, { walkable = null, ignore = [] } = {}) {
  if (!tree || typeof tree !== 'object') {
    return null;
  }

  if (typeof filter === 'string') {
    if (tree.hasOwnProperty(filter)) {
      return tree[filter];
    }

    return;
  } else if (filter(tree)) {
    return tree;
  }

  let returnValue = null;

  if (Array.isArray(tree)) {
    for (const value of tree) {
      returnValue = findInTree(value, filter, {
        walkable,
        ignore
      });

      if (returnValue) {
        return returnValue;
      }
    }
  } else {
    const walkables = !walkable ? Object.keys(tree) : walkable;

    for (const key of walkables) {
      if (!tree.hasOwnProperty(key) || ignore.includes(key)) {
        continue;
      }

      returnValue = findInTree(tree[key], filter, {
        walkable,
        ignore
      });

      if (returnValue) {
        return returnValue;
      }
    }
  }

  return returnValue;
};
