const { STARTING_BALANCE } = require("../config");
const cryptoHash = require("../util/crypto-hash");
const { ec } = require("../util/ec");
const Transaction = require("./transaction");

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }
  sign(data) {
    const hashData = cryptoHash(data);
    return this.keyPair.sign(hashData);
  }
  createTransaction({ amount, recipient }) {
    if(amount > this.balance) {
      throw new Error('amount exceeds balance');
    }

    return new Transaction({ 
      senderWallet: this, 
      recipient: recipient, 
      amount: amount,
    });
  }
}

module.exports = Wallet;