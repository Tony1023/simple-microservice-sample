const { Kafka } = require('kafkajs');
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId: 'order-service', brokers });

const producer = kafka.producer();

const channels = {
  orderCreateStatus: {
    consumer: kafka.consumer({ groupId: 'order-create-status-group' }),
    topic: 'order-create-status-channel',
  },
}

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