const uuid = require('uuid').v1;
const { MINING_REWARD, REWARD_INPUT } = require('../config');
const { verifySignature } = require('../util/ec');

class Transaction {
  constructor({senderWallet, recipient, amount, outputMap, input}) {
    this.id = uuid();
    this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
    this.input = input || this.createInput({ outputMap: this.outputMap, senderWallet });
  }

  createOutputMap({senderWallet, recipient, amount}) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
  
    return outputMap;
  }


  createInput({senderWallet, outputMap}) {

    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  update({senderWallet, recipient, amount}) {
    if(amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error('amount exceeds balance');
    }

    if(!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    const currentAmount = this.outputMap[senderWallet.publicKey];
    this.outputMap[senderWallet.publicKey] = currentAmount - amount;

    this.input = this.createInput({senderWallet, outputMap: this.outputMap})
  }

  static validTransaction(transaction) {
    const {input, outputMap} = transaction;
    const {address, amount, signature} = input;

    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);

    if(amount !== outputTotal) {
      console.error(`invalid transcation at address ${address}`);
      return false
    }

    if(!verifySignature({publicKey: address, data: outputMap, signature})) {
      console.error(`error transaction signature at address ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD }
    });
  }
}

module.exports = Transaction;