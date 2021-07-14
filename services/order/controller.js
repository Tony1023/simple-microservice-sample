const { producer, channels } = require('./kafka');
const logic = require('./logic');

const requestPool = {}; // txn: [req, res]

channels.orderCreateStatus.consumer.run({ eachMessage: async ({ message }) => {
  const payload = JSON.parse(message.value.toString());
  if (!requestPool[payload.id]) {
    return;
  }
  const [_, res] = requestPool[payload.id];

  switch (payload.status) {
    case 'payment-executed':
      await logic.setPaymentSuccessul(payload.id);
      break;
    case 'items-reserved':
      await logic.setReservationSuccessul(payload.id);
      break;
    case 'insufficient-balance':
      res.status(400).send('Insufficient balance.');
      await logic.rejectOrder(payload.id);
      break;
    case 'out-of-stock':
      res.status(400).send('Out of stock.');
      await logic.rejectOrder(payload.id);
    default: break;
  }

  if (await logic.isOrderComplete(payload.id)) {
    res.status(200).send();
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
        items: order.items.reduce((items, item) => {
          return [...items, { id: item.itemId, quantity: item. quantity }];
        }, []),
        id: order.id,
      })}],
    });
    requestPool[order.id] = [req, res];
  },
};