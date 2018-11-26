module.exports = (items, seperator = 'and') => (
  items.length > 1
    ? `${items.slice(0, items.length - 1).join(', ')} ${seperator} ${items[items.length - 1]}`
    : items[0]
);
