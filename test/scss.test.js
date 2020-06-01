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

  it('makes use of cache', async () => {
    expect.assertions(1);
    const compiler = new ScssCompiler(getPath('imports'));
    const fakeCompile = jest.fn(() => Promise.resolve('btw have i told you i use arch?'));
    compiler._compile = fakeCompile;
    await compiler.compile();
    await compiler.compile();
    await compiler.compile();
    expect(fakeCompile.mock.calls.length).toBe(1);
  });
});
