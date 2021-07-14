const { producer, channels } = require('./kafka');
const logic = require('./logic');

// channels.reserveInventory.consumer.run({ eachMessage: async({ message }) => {
//   const order = JSON.parse(message.value.toString());

// }});

module.exports = {
  reserveItems: async (req, res) => {
    try {
      await logic.reserveItems(req.body.items);
      res.status(200).send();
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  }
}