const { Sequelize, Model, DataTypes } = require('sequelize');

class Customer extends Model { };

/**
 * Doing these set-ups so that db is the same every time the server starts
 * Also avoid setting up npx stuff :D
 */
 const init = async () => {
  const dbManager = new Sequelize({
    database: 'postgres',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  });

  const queryInterface = dbManager.getQueryInterface();
  await queryInterface.dropDatabase('account-service');
  await queryInterface.createDatabase('account-service');

  const sequelize = new Sequelize({
    database: 'account-service',
    host: '127.0.0.1',
    dialect: 'postgres',
    define: {
      freezeTableName: true,
    },
    logging: false,
  });
  
  Customer.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Customer',
  });
  
  await sequelize.sync();
  await injectData();


};

const injectData = async () => {
  await Customer.bulkCreate([
    {
      id: '4f0ef6d5-14bd-46aa-91db-90667c6993ff',
      email: 'jose@123.com',
      balance: 0.0,
    },
    {
      id: 'cd79fffb-c998-4958-a34e-ba64a029e993',
      email: 'alice@bob.com',
      balance: 521.5,
    }
  ]);
}


module.exports = { Customer, init };

