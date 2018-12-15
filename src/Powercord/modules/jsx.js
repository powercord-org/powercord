const buble = require('buble');
const { readFileSync } = require('fs');

module.exports = () =>
  require.extensions['.jsx'] = (_module, filename) =>
    _module._compile(
      buble.transform(readFileSync(filename, 'utf8'), {
        jsx: 'React.createElement',
        objectAssign: 'Object.assign',
        target: { chrome: 52 }
      }).code,
      filename
    )


