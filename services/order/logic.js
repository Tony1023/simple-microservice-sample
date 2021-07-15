const { Order, OrderItem, sequelize } = require('./models');

module.exports = {
  createOrder: async (order) => {
    return Order.create(order, { include: 'items' });
  },
  
  findOrderById: async (id) => {
    return Order.findByPk(id, { include: 'items' });
  },
  
  setPaymentStatus: async (id, status) => {
    const order = await Order.findByPk(id);
    return order.update({ paymentStatus: status });
  },

  setInventoryStatus: async (id, status) => {
    const order = await Order.findByPk(id);
    return order.update({ inventoryStatus: status });
  },

}