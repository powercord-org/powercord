/* eslint-env jest */
const { join } = require('path');
const JsxCompiler = require('../src/fake_node_modules/powercord/compilers/jsx');
const rmdir = require('../src/fake_node_modules/powercord/util/rmdirRf');
const cachePath = join(__dirname, '..', '.cache', 'jsx');

describe('JSX Compilation', () => {
  beforeEach(() => rmdir(cachePath));

  it('makes use of cache', async () => {
    expect.assertions(1);
    const compiler = new JsxCompiler(join(__dirname, 'test-data/jsx/Test.jsx'));
    const fakeCompile = jest.fn(() => Promise.resolve('btw have i told you i use arch?'));
    compiler._compile = fakeCompile;
    await compiler.compile();
    await compiler.compile();
    await compiler.compile();
    expect(fakeCompile.mock.calls.length).toBe(1);
  });
});
