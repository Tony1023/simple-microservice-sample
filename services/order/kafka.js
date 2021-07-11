const { Kafka } = require('kafkajs');
const brokers = ['localhost:9092'];
const kafka = new Kafka({ clientId: 'order-service', brokers });

module.exports = {
  producer: kafka.producer(),
  createConsumer: () => kafka.consumer({ groupId: 'my-group' }),
}