const CSSCompiler = require('./css');
const JsxCompiler = require('./jsx');
const ScssCompiler = require('./scss');
const LessCompiler = require('./less');
const StylusCompiler = require('./stylus');

module.exports = {
  css: CSSCompiler,
  jsx: JsxCompiler,
  scss: ScssCompiler,
  less: LessCompiler,
  stylus: StylusCompiler,
  resolveCompiler: (file) => {
    switch (file.split('.').pop()) {
      case 'jsx':
        return new JsxCompiler(file);
      case 'scss':
        return new ScssCompiler(file);
      case 'less':
        return new LessCompiler(file);
      case 'styl':
        return new StylusCompiler(file);
      case 'css':
        return new CSSCompiler(file);
    }
  }
};
