const express = require('express');
const controller = require('./controller')

module.exports = (app) => {
  const router = express.Router();

  app.use('/api', router);
  router.post('/reserve', controller.reserveItems);
}