const { verifySignature } = require('../util/ec');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('transaction', () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;
    transaction = new Transaction({
      senderWallet,
      recipient,
      amount,
    });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has an `outputMap`', () => {
      expect(transaction).toHaveProperty('outputMap');
    });
    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });
    it('outputs the remaining balance for the `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(senderWallet.balance - amount);
    });
  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });
    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });
    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });
    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });
    it('signs the input', () => {
      const isVerified = verifySignature({
        publicKey: senderWallet.publicKey,
        data: transaction.outputMap,
        signature: transaction.input.signature,
      })
      expect(isVerified).toBe(true);
    });
  });

  describe('validTransaction()', () => {
    let errorMock;

    beforeEach(() => {
      errorMock = jest.fn();

      global.console.error = errorMock;
    });

    describe('when transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction(transaction))
          .toBe(true);
      });
    });

    describe('when transaction is invalid', () => {
      describe('and a transaction outputMap value is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[senderWallet.publicKey] = 99999;

          expect(Transaction.validTransaction(transaction))
            .toBe(false);
          expect(errorMock).toHaveBeenCalled();
        })
      });

      describe('and the transaction input signature is invalid', () => {
        it('returns false and logs an error', () => {
          transaction.input.signature = new Wallet().sign('invalid-data');

          expect(Transaction.validTransaction(transaction))
            .toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      

    });
  });

  describe('update()', () => {
    let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

    beforeEach(() => {
      originalSignature = transaction.input.signature;
      originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
      nextRecipient = 'next-recipient';
      nextAmount = 50;

      transaction.update({
        senderWallet, recipient: nextRecipient, amount: nextAmount
      });
    });
    
    it('outputs the amount of the next recipient', () => {
      expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
    });

    it('substracts the amount from the original sender output amount', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(originalSenderOutput - amount);
    });

    it('maintains a total output that matches the input amount', () => {
      const totalOutput = Object.values(transaction.outputMap)
        .reduce((total, amount) => total+amount);

      expect(totalOutput).toEqual(transaction.input.amount);
    });

    it('re-signs the transaction', () => {
      expect(transaction.input.signature).not.toEqual(originalSignature);
    });
  });
});