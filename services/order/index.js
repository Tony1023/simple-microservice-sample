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
  client.findAccount({ id: 'cd79fffb-c998-4958-a34e-ba64a029e993' }, (err, response) => {
    console.log(`Customer email: ${response.email}, balance: ${response.balance}`);
  });
})();