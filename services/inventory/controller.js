const { producer, channels } = require('./kafka');
const logic = require('./logic');

channels.reserveInventory.consumer.run({ eachMessage: async ({ message }) => {
  const order = JSON.parse(message.value.toString());
  try {
    await logic.reserveItems(order.items);
    producer.send({
      topic: 'order-create-status-channel',
      messages: [{ value: JSON.stringify({
        status: 'items-reserved',
        id: order.id,
      })}]
    });
  } catch (err) {
    producer.send({
      topic: 'order-create-status-channel',
      messages: [{ value: JSON.stringify({
        status: 'out-of-stock',
        id: order.id,
      })}]
    });
  }
}});

channels.unreserveItems.consumer.run({ eachMessage: async ({ message }) => {
  const order = JSON.parse(message.value.toString());
  logic.unreserveItems(order.items);
}});

module.exports = {
  reserveItems: async (req, res) => {
    console.log(req.body.items);
    try {
      await logic.reserveItems(req.body.items);
      res.status(200).send();
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
}