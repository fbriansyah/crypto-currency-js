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
}

module.exports = Blockchain;