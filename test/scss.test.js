/* eslint-env jest */
const { join } = require('path');
const ScssCompiler = require('../src/fake_node_modules/powercord/compilers/scss');
const rmdir = require('../src/fake_node_modules/powercord/util/rmdirRf');
const cachePath = join(__dirname, '..', '.cache', 'scss');

const getPath = (type) => join(__dirname, 'test-data/scss', type, 'style.scss');
const expected = `.test {
  color: red;
}`;
const expectedLong = `.test {
  color: red;
}

.test {
  color: blue;
}`;

describe('SCSS Compilation', () => {
  beforeEach(() => rmdir(cachePath));

  it('completes successfully', () => {
    expect.assertions(1);
    const compiler = new ScssCompiler(getPath('basic'));
    return expect(compiler.compile()).resolves.toEqual(expected);
  });

  describe('File imports', () => {
    it('imports files', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports files without extensions', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_noext'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports files with underscores', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_underscore'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports files with underscores and without extension', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_underscore_noext'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports nested files', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_nested'));
      return expect(compiler.compile()).resolves.toEqual(expectedLong);
    });

    it('handles colliding import urls', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_collision'));
      return expect(compiler.compile()).resolves.toEqual(expectedLong);
    });

    it('imports css files', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_css'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports css files without extensions', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_css_noext'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports _index.scss when importing directory', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_index'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('does not import index.scss', () => {
      expect.assertions(1);
      const compiler = new ScssCompiler(getPath('imports_index_invalid'));
      return expect(compiler.compile()).rejects.toThrow('Unresolved import: failed to locate "folder"');
    });
  });

  it('makes use of cache', async () => {
    expect.assertions(1);
    const compiler = new ScssCompiler(getPath('basic'));
    const fakeCompile = jest.fn(() => Promise.resolve('btw have i told you i use arch?'));
    compiler._compile = fakeCompile;
    await compiler.compile();
    await compiler.compile();
    await compiler.compile();
    expect(fakeCompile.mock.calls.length).toBe(1);
  });
});
