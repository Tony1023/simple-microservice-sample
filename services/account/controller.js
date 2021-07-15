const logic = require('./logic');
const { producer, channels } = require('./kafka');


channels.executePayment.consumer.run({ eachMessage: async ({ message }) => {
  const order = JSON.parse(message.value.toString());
  if (await logic.deductBalanceOrFalse(order.customerId, order.amount)) {
    producer.send({
      topic: 'order-create-status-channel',
      messages: [{ value: JSON.stringify({
        id: order.id,
        status: 'payment-executed',
      })}],
    })
  } else {
    producer.send({
      topic: 'order-create-status-channel',
      messages: [{ value: JSON.stringify({
        status: 'insufficient-balance',
        id: order.id,
      })}],
    })
  }
}});

channels.refundPayment.consumer.run({ eachMessage: async ({ message }) => {
  const order = JSON.parse(message.value.toString());
  logic.addToBalance(order.customerId, order.amount);
}});

module.exports = {
  register: async (req, res) => {

  },

  getProfile: async (req, res) => {
    const { id, email } = req.query;
    console.log(id, email);
    try {
      let profile;
      if (id) {
        profile = await logic.getCustomerProfileById(id);
      } else if (email) {
        profile = await logic.getCustomerProfileByEmail(email);
      } else {
        res.status(400).send('Need id or email for query.');
      }
      profile ? res.send(profile) : res.status(404).send();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }

};