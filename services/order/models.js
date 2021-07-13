const { Sequelize, Model, DataTypes } = require('sequelize');

class Order extends Model { };

class OrderItem extends Model { };

const txnStatus = Sequelize.ENUM('pending', 'successful', 'rejected');

const init = async () => {
  const dbManager = new Sequelize({
    database: 'postgres',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  });

  const queryInterface = dbManager.getQueryInterface();
  await queryInterface.dropDatabase('order-service');
  await queryInterface.createDatabase('order-service');

  const sequelize = new Sequelize({
    database: 'order-service',
    host: '127.0.0.1',
    dialect: 'postgres',
    define: {
      freezeTableName: true,
    },
    logging: false,
  });

  Order.init({
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
    },
    amount: DataTypes.FLOAT,
    customerId: DataTypes.UUID,
    status: { 
      type: txnStatus,
      defaultValue: 'pending',
    },
    paymentStatus: {
      type: txnStatus,
      defaultValue: 'pending',
    },
    inventoryStatus: {
      type: txnStatus,
      defaultValue: 'pending'
    },
  }, { sequelize, modelName: 'Order' });

  OrderItem.init({
    orderId: DataTypes.UUID,
    itemId: DataTypes.UUID,
    quantity: DataTypes.INTEGER,
  }, { sequelize, modelName: 'OrderItem' });

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
  
  OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    targetKey: 'id',
    as: 'order',
    onDelete: 'CASCADE',
  });

  await sequelize.sync();
  await injectData();
};

const injectData = async () => {
  await Order.create({
    id: '14933042-253b-4b78-ae40-3029d9add828',
    amount: '18.97',
    status: 'successful',
    paymentStatus: 'successful',
    inventoryStatus: 'successful',
  });

  await OrderItem.bulkCreate([
    {
      orderId: '14933042-253b-4b78-ae40-3029d9add828',
      itemId: '9e2d6ae6-1fb1-46c8-b631-cd230b3c3f17',
      quantity: 1,
      customerId: 'cd79fffb-c998-4958-a34e-ba64a029e993',
    },
    {
      orderId: '14933042-253b-4b78-ae40-3029d9add828',
      itemId: '0998c2f0-c122-4507-bfd7-ebfe04665ebe',
      quantity: 2,
      customerId: 'cd79fffb-c998-4958-a34e-ba64a029e993',
    },
  ])
}

module.exports = {
  Order,
  OrderItem,
  init,
}