const cryptoHash = require('./crypto-hash');

const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

function verifySignature({data, publicKey, signature}) {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  const hashData = cryptoHash(data);

  return keyFromPublic.verify(hashData, signature);
}

module.exports = { ec, verifySignature };