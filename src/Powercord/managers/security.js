const { get } = require('powercord/http');
const { createHash, createPublicKey, createVerify } = require('crypto');

const PUBLIC_KEY = createPublicKey(
  `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7KAqlobCfhVHIkluaONYfIBTKi/8
QlgE0GfqYFjWSL0HiKO8FI/jwY+aMhGLICxcc3Bdas8EBXEJDc0YxbRJ+w==
-----END PUBLIC KEY-----`,
  'pem'
);

const fingerprints = new Set();
const safeHas = Set.prototype.has.bind(fingerprints);

async function fetchFingerprints () {
  const { body } = await get('https://powercord.dev/api/v2/safety/fingerprints');
  const items = body.toString().split('\n').slice(2);
  const signature = items.pop();
  const verifier = createVerify('sha256').update(items.join('\n')).end();
  if (!verifier.verify(PUBLIC_KEY, Buffer.from(signature, 'hex'))) {
    // todo: security warn
    return;
  }

  fingerprints.clear();
  items.forEach((item) => fingerprints.add(item));
}

function isFlagged (owner, repo) {
  const ownerHash = createHash('sha256').update(`o:${owner.toLowerCase()}`).digest('hex');
  const repoHash = createHash('sha256').update(`r:${owner.toLowerCase()}/${repo.toLowerCase()}`).digest('hex');
  return safeHas(ownerHash) || safeHas(repoHash);
}

module.exports = Object.freeze({
  fetchFingerprints,
  isFlagged
});
