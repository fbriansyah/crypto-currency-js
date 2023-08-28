const {GENESIS_DATA, MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');
class Block {
  constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA)
  }
  static mineBlock({lastBlock, data}) {
    let timestamp, hash;
    // const timestamp = Date.now();
    const lastHash = lastBlock.hash;
    const { difficulty } = lastBlock;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hash.substring(0, difficulty) !== '0'.repeat(difficulty)
    );

    return new this({
      data,
      lastHash,
      timestamp,
      difficulty,
      nonce,
      hash
      // hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty),
    })
  }
  static adjustDiffuculty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;

    const difference = timestamp - originalBlock.timestamp;
    console.log('timestamp:', timestamp)
    console.log('originalBlock.timestamp:', originalBlock.timestamp)
    console.log('difference:', difference)
    
    if (difference > MINE_RATE) {
      return difficulty - 1;
    }

    return difficulty + 1;
  }
}

module.exports = Block;