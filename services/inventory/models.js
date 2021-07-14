const { Sequelize, Model, DataTypes } = require('sequelize');

class Item extends Model { };

let sequelize;

const init = async () => {
  const dbManager = new Sequelize({
    database: 'postgres',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  });

  const queryInterface = dbManager.getQueryInterface();
  await queryInterface.dropDatabase('inventory-service');
  await queryInterface.createDatabase('inventory-service');

  sequelize = new Sequelize({
    database: 'inventory-service',
    host: '127.0.0.1',
    dialect: 'postgres',
    define: {
      freezeTableName: true,
    },
  });

  Item.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      unique: true,
    },
    quantity: DataTypes.INTEGER,
  }, { sequelize, modelName: 'Item' });

  await sequelize.sync();
  await injectData();
}

const injectData = async () => {
  await Item.bulkCreate([
    {
      id: '9e2d6ae6-1fb1-46c8-b631-cd230b3c3f17',
      quantity: 100,
    },
    {
      id: '0998c2f0-c122-4507-bfd7-ebfe04665ebe',
      quantity: 1,
    },
    {
      id: '08f4600d-f304-43f5-bb19-b373efa00899',
      quantity: 5,
    },
    {
      id: 'e1b537df-f1bc-41e1-9ca2-0c4f7d14dfdb',
      quantity: 10,
    },
  ])
}

module.exports = {
  init,
  Item,
  sequelize,
}