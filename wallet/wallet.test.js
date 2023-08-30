const { verifySignature } = require('../util/ec');
const Transaction = require('./transaction');
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

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws an error', () => {
        expect(() => wallet.createTranscation({
          amount: 9999, 
          recipient: 'foo-recipient'
        })).toThrow('amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTranscation({ amount, recipient });
      });

      it('creates an instance of `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it('outputs the amount the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });

    });
  });
});