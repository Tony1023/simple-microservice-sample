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

/**
 * Implements the SayHello RPC method.
 */
const findAccount = (call, callback) => {
  callback(null, { message: 'Account info for ' + call.request.name });
}

(() => {
  const server = new grpc.Server();
  server.addService(accountProto.Account.service, { findAccount: findAccount });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
  });
})();
