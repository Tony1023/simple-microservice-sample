const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync(`${__dirname}/../protos/account.proto`, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const accountProto = grpc.loadPackageDefinition(packageDef).simple_microservice_sample.account;

const { Customer } = require('./models');

const findAccount = async (call, callback) => {
  const customer = await Customer.findByPk(call.request.id);
  callback(null, { ...customer.dataValues });
}

(async () => {
  const server = new grpc.Server();
  server.addService(accountProto.Account.service, { findAccount: findAccount });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
})();
