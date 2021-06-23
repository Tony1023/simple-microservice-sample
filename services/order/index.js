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

(() => {
  const client = new accountProto.Account('localhost:50051',
    grpc.credentials.createInsecure()
  );
  client.findAccount({ name: 'TonyLu' }, (err, response) => {
    console.log('Response: ', response.message);
  });
})();