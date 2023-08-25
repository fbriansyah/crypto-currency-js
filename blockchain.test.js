const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
  let blockchain, newBlockChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newBlockChain = new Blockchain();

    originalChain = blockchain.chain;
  })

  it('contains a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  })

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block to the chain', () => {
    const newData = 'foo bar';
    blockchain.addBlock({data: newData});

    expect(blockchain.chain[blockchain.chain.length-1].data)
      .toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = {data: 'fake-genesis'};

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      })
    });

    describe('when the chain starts with the genesis block and has multiple block', () => {
      beforeEach(() => {
        blockchain.addBlock({data: "John"});
        blockchain.addBlock({data: "Jony"});
        blockchain.addBlock({data: "Jane"});
      });
      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'changed-data';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    describe('when the new chain is not longer', () => {
      it('does not replace the chain', () => {
        newBlockChain.chain[0] = {new: 'chain'};
        blockchain.replaceChain(newBlockChain.chain);

        expect(blockchain.chain).toEqual(originalChain);
      });
    })

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        newBlockChain.addBlock({data: "John"});
        newBlockChain.addBlock({data: "Jony"});
        newBlockChain.addBlock({data: "Jane"});
      })
      describe('and the new chain is invalid', () => {
        it('does not replace the chain', () => {
          newBlockChain.chain[2].hash = 'some-fake-hash';
          blockchain.replaceChain(newBlockChain.chain);

          expect(blockchain.chain).toEqual(originalChain);
        });
      });
      describe('and the new chain is valid', () => {
        it('replace the chain', () => {
          blockchain.replaceChain(newBlockChain.chain);

          expect(blockchain.chain).toEqual(newBlockChain.chain);
        });
      });
    });
  });
})