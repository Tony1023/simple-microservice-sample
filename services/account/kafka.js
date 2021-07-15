const { Kafka } = require('kafkajs');
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId: 'account-service', brokers });

const producer = kafka.producer();

const channels = {
  executePayment: {
    consumer: kafka.consumer({ groupId: 'execute-payment-group' }),
    topic: 'execute-payment-channel',
  },
  refundPayment: {
    consumer: kafka.consumer({ groupId: 'refund-payment-group' }),
    topic: 'refund-payment-channel',
  }
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
  },
  sendMessage: (topic, value) => {
    producer.send({ topic, messages: [{ value: JSON.stringify(value) }]});
  }
}