const { Order, OrderItem, sequelize } = require('./models');

module.exports = {
  createOrder: async (order) => {
    return Order.create(order, { include: 'items' });
  },
  setOrderStatus: async (id, { status, paymentStatus, inventoryStatus }) => {
    const order = await Order.findByPk(id);
    return order.update({ status, paymentStatus, inventoryStatus });
  }
}