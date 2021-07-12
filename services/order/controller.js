const { producer, channels } = require('./kafka');

let txnCounter = 0;

const requestPool = {}; // txn: [req, res]

channels.orderCreateStatus.consumer.run({ eachMessage: async ({ message }) => {
  const payload = JSON.parse(message.value.toString());
  const [req, res] = requestPool[payload.txnId];

  switch (payload.status) {
    case 'payment-executed':
      res.status(200);
      break;
    case 'insufficient-balance':
      res.status(400).send('Insufficient balance.');
      break;
    case 'customer-not-found':
      res.status(404).send(`Customer id ${req.body.customerId} not found`);
      break;
    default: break;
  }
}});

module.exports = {
  createOrder: async (req, res) => {
    const { customerId, amount, items } = req.body;
    const txnId = txnCounter++;
    producer.send({
      topic: 'execute-payment-channel',
      messages: [{ value: JSON.stringify({
        customerId,
        amount,
        txnId,
      })}],
    });
    // await producer.send({
    //   topic: 'prepare-inventory-channel',
    //   messages: [
    //     { value: JSON.stringify({
    //       items,
    //       txnId,
    //     })}
    //   ],
    // });
    requestPool[txnId] = [req, res];
  },
};