const { verifySignature } = require('../util/ec');
const Wallet = require('./wallet');

describe('Wallet', () => {
  let wallet;

  beforeAll(() => {
    wallet = new Wallet;
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });
  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('signing data', () => {
    const data = 'foo-bar';

    it('verifies a signature', () => {
      const isVerified = verifySignature({
        data,
        publicKey: wallet.publicKey,
        signature: wallet.sign(data), 
      })
      expect(isVerified).toBe(true);
    });
    it('does not verify an invalid signature', () => {
      const isVerified = verifySignature({
        data,
        publicKey: wallet.publicKey,
        signature: new Wallet().sign(), 
      })
      expect(isVerified).toBe(false);
    });
  });
});