const { Order, OrderItem, sequelize } = require('./models');

module.exports = {
  createOrder: async (order) => {
    return Order.create(order, { include: 'items' });
  },

  rejectOrder: async (id) => {
    const order = await Order.findByPk(id);
    return order.update({ rejected: true });
  },

  setPaymentSuccessul: async (id) => {
    const order = await Order.findByPk(id);
    return order.update({ success: order.success | 1 });
  },

  setReservationSuccessul: async (id) => {
    const order = await Order.findByPk(id);
    return order.update({ success: order.success | 2 });
  },

  isOrderComplete: async (id) => {
    const order = await Order.findByPk(id);
    console.log(order.success);
    return (order.success === 3);
  }
}