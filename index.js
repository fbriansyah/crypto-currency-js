const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain/blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/wallet');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain: blockchain});
const transactionPool = new TransactionPool();
const wallet = new Wallet();

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });

  pubsub.broadcastChain();
  
  res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;

  // const transaction = wallet.createTransaction({ recipient, amount });
  let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch(error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  transactionPool.setTransaction(transaction);

  console.log('transactionPool', transactionPool);

  res.json({ type: 'success', transaction });
});

const syncChains = () => {
  request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (err, response, body) => {
    if(!err && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() *1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Application run at localhost:${PORT}`);
  if(PEER_PORT) {
    syncChains();
  }
});
