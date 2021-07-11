const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { createConsumer } = require('./kafka');

const packageDef = protoLoader.loadSync(`${__dirname}/../protos/account.proto`, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const accountProto = grpc.loadPackageDefinition(packageDef).simple_microservice_sample.account;

const { Customer, init } = require('./models');

const findAccount = async (call, callback) => {
  const customer = await Customer.findByPk(call.request.id);
  callback(null, { ...customer.dataValues });
}

(async () => {
  const consumer = createConsumer();
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-create-channel' });
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log(message.value.toString());
    }
  })
  // await init();
  // const server = new grpc.Server();
  // server.addService(accountProto.Account.service, { findAccount: findAccount });
  // server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  //   server.start();
  // });
})();
