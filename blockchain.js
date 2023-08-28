const Block = require("./block");
const cryptoHash = require("./crypto-hash");

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

  replaceChain(chain) {
    if(chain.length <= this.chain.length) {
      console.error('the incoming chain must be longer');
      return;
    }

    if(!Blockchain.isValidChain(chain)) {
      console.error('the incoming chain must be valid');
      return;
    }

    console.log('replacing chain with', chain);
    this.chain = chain;
  }
}

module.exports = Blockchain;