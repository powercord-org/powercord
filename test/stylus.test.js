/* eslint-env jest */
const { join } = require('path');
const StylusCompiler = require('../src/fake_node_modules/powercord/compilers/stylus');
const rmdir = require('../src/fake_node_modules/powercord/util/rmdirRf');
const cachePath = join(__dirname, '..', '.cache', 'stylus');

const getPath = (type) => join(__dirname, 'test-data/stylus', type, 'style.styl');
const expected = `.test {
  color: #f00;
}
`;
const expectedLong = `.test {
  color: #f00;
}
.test {
  color: #00f;
}
`;

describe('Stylus Compilation', () => {
  beforeEach(() => rmdir(cachePath));

  it('completes successfully', () => {
    expect.assertions(1);
    const compiler = new StylusCompiler(getPath('basic'));
    return expect(compiler.compile()).resolves.toEqual(expected);
  });

  describe('File imports', () => {
    it('imports files imported', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports files without extensions', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports_noext'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports nested files', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports_nested'));
      return expect(compiler.compile()).resolves.toEqual(expectedLong);
    });

    it('imports index.styl when importing a folder', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports_index'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('imports index.styl when importing a folder without trailing slash', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports_index_notrailing'));
      return expect(compiler.compile()).resolves.toEqual(expected);
    });

    it('handles import globbing', () => {
      expect.assertions(1);
      const compiler = new StylusCompiler(getPath('imports_globbing'));
      return expect(compiler.compile()).resolves.toEqual(expectedLong);
    });
  });

  it('makes use of cache', async () => {
    expect.assertions(1);
    const compiler = new StylusCompiler(getPath('basic'));
    const fakeCompile = jest.fn(() => Promise.resolve('btw have i told you i use arch?'));
    compiler._compile = fakeCompile;
    await compiler.compile();
    await compiler.compile();
    await compiler.compile();
    expect(fakeCompile.mock.calls.length).toBe(1);
  });
});
