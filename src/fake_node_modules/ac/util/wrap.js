module.exports = (elem, wrapper) => {
  elem.parentNode.appendChild(wrapper);
  wrapper.appendChild(elem);

  return wrapper;
};
