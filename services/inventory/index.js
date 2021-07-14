const express = require('express');

const app = express();
const PORT = 8011;

app.use(express.json());
app.server = app.listen(PORT, () => {
  console.log(`Inventory service listening on port ${PORT}`);
});

const models = require('./models');
const kafka = require('./kafka');

(async () => {
  await models.init();
  // await kafka.init();

  require('./routes')(app);
})();