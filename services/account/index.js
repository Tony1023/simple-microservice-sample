const express = require('express');

const app = express();
const PORT = 8010;

app.use(express.json());
app.server = app.listen(PORT, () => {
  console.log(`Account service listening on port ${PORT}`);
});

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const kafka = require('./kafka');

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
  await init();
  await kafka.init();

  require('./routes')(app);
  // const server = new grpc.Server();
  // server.addService(accountProto.Account.service, { findAccount: findAccount });
  // server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  //   server.start();
  // });
})();
