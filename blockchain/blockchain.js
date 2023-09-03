const Block = require("./block");
const cryptoHash = require("../util/crypto-hash");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/wallet");

class Blockchain {
  constructor() {
    const genesis = Block.genesis();
    this.chain = [genesis]
  }

  addBlock({data}) {
    const lastBlock = this.chain[this.chain.length-1];
    const newBlock = Block.mineBlock({
      lastBlock,
      data
    })
    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if(chain.length <= this.chain.length) {
      console.error('the incoming chain must be longer');
      return;
    }

    if(!Blockchain.isValidChain(chain)) {
      console.error('the incoming chain must be valid');
      return;
    }

    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error('The incoming chain has invalid data');
      return;
    }

    if(onSuccess) {
      onSuccess();
    }

    console.log('replacing chain with', chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;

          if (rewardTransactionCount > 1) {
            console.error('miner rewards exceeds limit');
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error('miner reward amount is invalid');
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('invalid transaction');
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });

          if (transaction.input.amount !== trueBalance) {
            console.error('invalid input amount');
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error('an identical transaction appears more than once in the block');
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  static isValidChain(chain) {
    // check genesis block;
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false
    };

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];
      const actualLastHash = chain[i-1].hash;
      const lastDifficulty = chain[i-1].difficulty;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

      if (hash !== validatedHash) return false;

      if (Math.abs(lastDifficulty - difficulty) > 1) {
        return false;
      }
    }

    return true;
  }
}

module.exports = Blockchain;