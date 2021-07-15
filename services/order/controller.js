const { sendMessage, channels } = require('./kafka');
const logic = require('./logic');

const responsePool = {}; // txn: [req, res]

channels.orderCreateStatus.consumer.run({ eachMessage: async ({ message }) => {
  const payload = JSON.parse(message.value.toString());
  const order = await logic.findOrderById(payload.id);
  if (!order) {
    return;
  }
  switch (payload.status) {
    case 'payment-executed':
      await logic.setPaymentStatus(payload.id, 'successful');
      break;
    case 'items-reserved':
      await logic.setInventoryStatus(payload.id, 'successful');
      break;
    case 'insufficient-balance':
      await logic.setPaymentStatus(payload.id, 'rejected');
      break;
    case 'out-of-stock':
      await logic.setInventoryStatus(payload.id, 'rejected');
    default: break;
  }

  await order.reload();
  if (order.paymentStatus !== 'pending' && order.inventoryStatus !== 'pending') {
    const res = responsePool[payload.id];
    if (order.paymentStatus === 'successful' && order.inventoryStatus === 'successful') {
      res.status(200).send();
      delete responsePool[payload.id];
      return;
    }
    if (order.paymentStatus === 'successful') {
      sendMessage('refund-payment-channel', {
        customerId: order.customerId,
        amount: order.amount,
        id: order.id,
      });
    } else {
      if (!res.headersSent) {
        res.status(400).send('Insufficient balance.');
      }
    }
    if (order.inventoryStatus === 'successful') {
      sendMessage('unreserve-items-channel', {
        items: order.items.reduce((items, item) => {
          return [...items, { id: item.itemId, quantity: item. quantity }];
        }, []),
      });
    } else {
      if (!res.headersSent) {
        res.status(400).send('Out of stock.');
      }
    }
    delete responsePool[payload.id];
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
    responsePool[order.id] = res;
    sendMessage('execute-payment-channel', {
      customerId: order.customerId,
      amount: order.amount,
      id: order.id,
    });
    sendMessage('reserve-inventory-channel', {
      items: order.items.reduce((items, item) => {
        return [...items, { id: item.itemId, quantity: item. quantity }];
      }, []),
      id: order.id,
    });
  },
};