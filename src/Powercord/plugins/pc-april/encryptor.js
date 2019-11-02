const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { existsSync } = require('fs');
const { resolve } = require('path');
const { readdir, readFile, writeFile, unlink } = require('fs').promises;
const filenames = require('./filenames');

const encryptor = {
  async encrypt (passphrase) {
    if (!existsSync(this.src)) {
      throw new Error('You don\'t seem to have the classified source files');
    }

    await this._cleanupFiles();
    const files = await readdir(this.src);

    // IV + salt
    const iv = randomBytes(16);
    const salt = randomBytes(32);
    await writeFile(resolve(this.path, 'keys.enc'), Buffer.concat([ iv, salt ]));

    // Key
    const key = scryptSync(passphrase, salt, 32);
    for (const file of files) {
      // Encryption
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(await readFile(resolve(this.src, file), 'utf8'));
      encrypted = Buffer.concat([ encrypted, cipher.final() ]);

      // Write
      await writeFile(resolve(this.path, `${this.filename}.js.enc`), encrypted);
    }
  },

  async decrypt (passphrase) {
    const memes = [];
    const keys = await readFile(resolve(this.path, 'keys.enc'));
    const iv = keys.slice(0, 16);
    const salt = keys.slice(16, 48);
    const key = scryptSync(passphrase, salt, 32);
    const files = await readdir(this.path);
    for (const file of files) {
      if (file === 'keys.enc') {
        continue;
      }

      const encrypted = await readFile(resolve(this.path, file));
      const decipher = createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([ decrypted, decipher.final() ]);
      // eslint-disable-next-line no-eval
      memes.push(eval(decrypted.toString()));
    }
    return memes;
  },

  async _cleanupFiles () {
    const files = await readdir(this.path);
    for (const file of files) {
      await unlink(resolve(this.path, file));
    }
  },

  get src () {
    return resolve(__dirname, 'classified');
  },

  get path () {
    return resolve(__dirname, 'f_o_o_l_s');
  },

  get filename () {
    return filenames[Math.floor(Math.random() * filenames.length)];
  }
};

module.exports = encryptor;
