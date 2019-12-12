const { getModuleByDisplayName } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const toCamelCase = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
    index === 0 ? match.toLowerCase() : match.toUpperCase()
  ).replace(/\s+|&/g, '');

  const TabBar = await getModuleByDisplayName('TabBar');
  inject('pc-utilitycls-sidebar', TabBar.prototype, 'render', function (_, res) {
    res.props['data-selected-item'] = this.props.selectedItem;

    return res;
  });

  inject('pc-utilitycls-sidebar-children', TabBar.prototype, 'renderChildren', (_, res) => {
    let sectionText, sectionType;

    if (typeof res.props.children === 'string') {
      sectionType = (res.type.displayName).toLowerCase();
      sectionText = toCamelCase(res.props.children);
    } else if (Array.isArray(res.props.children)) {
      const section = res.props.children.find(child => child && child.props && typeof child.props.children === 'string');
      if (section) {
        sectionText = toCamelCase(section.props.children);
      }
    }

    const sectionSuffix = `${(sectionType && `-${sectionType}`) || ''}${(sectionText && `-${sectionText}`) || ''}`;
    if (typeof res.props.className === 'undefined') {
      res.props.className = `${`settings${sectionSuffix}`}`;
    } else {
      res.props.className += ` ${`settings${sectionSuffix}`}`;
    }

    return res;
  });

  return async () => {
    uninject('pc-utilitycls-sidebar');
    uninject('pc-utilitycls-sidebar-children');
  };
};
