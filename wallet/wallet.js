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
  createTransaction({ amount, recipient, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }
    
    if(amount > this.balance) {
      throw new Error('amount exceeds balance');
    }

    return new Transaction({ 
      senderWallet: this, 
      recipient: recipient, 
      amount: amount,
    });
  }
  
  static calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i=chain.length-1; i>0; i--) {
      const block = chain[i];

      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
  }
}

module.exports = Wallet;