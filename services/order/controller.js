const { producer, channels } = require('./kafka');
const logic = require('./logic');

const requestPool = {}; // txn: [req, res]

channels.orderCreateStatus.consumer.run({ eachMessage: async ({ message }) => {
  const payload = JSON.parse(message.value.toString());
  if (!requestPool[payload.id]) {
    return;
  }
  const [req, res] = requestPool[payload.id];

  switch (payload.status) {
    case 'payment-executed':
      await logic.setOrderStatus(payload.id, {
        paymentStatus: 'successful',
      });
      res.status(200);
      break;
    case 'insufficient-balance':
      res.status(400).send('Insufficient balance.');
      await logic.setOrderStatus(payload.id, {
        status: 'rejected',
        paymentStatus: 'rejected',
      });
      break;
    default: break;
  }
}});

module.exports = {
  createOrder: async (req, res) => {
    const parsedOrder = {
      customerId: req.body.customerId,
      amount: req.body.amount,
      items: req.body.items.reduce((items, item) => {
        return [...items, { itemId: item.id, quantity: item.quantity }];
      }, []),
    };
    console.log(parsedOrder);
    const order = await logic.createOrder(parsedOrder);
    producer.send({
      topic: 'execute-payment-channel',
      messages: [{ value: JSON.stringify({
        customerId: order.customerId,
        amount: order.amount,
        id: order.id,
      })}],
    });
    producer.send({
      topic: 'reserve-inventory-channel',
      messages: [{ value: JSON.stringify({
        items: order.items,
        id: order.id,
      })}],
    });
    requestPool[order.id] = [req, res];
  },
};