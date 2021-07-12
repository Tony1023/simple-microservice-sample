const logic = require('./logic');
const { producer, channels } = require('./kafka');


channels.executePayment.consumer.run({ eachMessage: async ({ message }) => {
  const order = JSON.parse(message.value.toString());
  const customer = await logic.getCustomerProfileById(order.customerId);
  if (customer) {
    if (customer.balance > order.amount) {
      customer.balance -= order.amount;
      await customer.save();
      producer.send({
        topic: 'order-create-status-channel',
        messages: [{ value: JSON.stringify({
          txnId: order.txnId,
          status: 'payment-executed',
        })}],
      })
    } else {
      producer.send({
        topic: 'order-create-status-channel',
        messages: [{ value: JSON.stringify({
          status:'insufficient-balance',
          txnId: order.txnId,
        })}],
      })
    }
  } else {
    producer.send({
      topic: 'order-create-status-channel',
      messages: [{ values: JSON.stringify({
        status: 'customer-not-found',
        txnId: order.txnId,
      })}],
    })
  }
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