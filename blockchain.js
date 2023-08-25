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
      const { timestamp, lastHash, hash, data } = chain[i];
      const actualLastHash = chain[i-1].hash;

      if (lastHash !== actualLastHash) return false;

      const validatedHash = cryptoHash(timestamp, lastHash, data);

      if (hash !== validatedHash) return false;
    }

    return true;
  }
}

module.exports = Blockchain;