const { Kafka } = require('kafkajs');
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId: 'inventory-service', brokers });

const producer = kafka.producer();

const channels = {
  reserveInventory: {
    consumer: kafka.consumer({ groupId: 'reserve-inventory-group' }),
    topic: 'reserve-inventory-channel',
  }
};

module.exports = {
  producer,
  channels,
  init: async () => {
    await producer.connect();
    for (const channel of Object.values(channels)) {
      await channel.consumer.connect();
      await channel.consumer.subscribe({ topic: channel.topic });
    }
  }
}