const { Item, sequelize } = require('./models');

module.exports = {
  reserveItems: async (items) => {
    return Item.sequelize.transaction(async (t) => {
      for (const item of items) {
        const inventory = await Item.findByPk(item.id, {
          transaction: t,
          lock: t.lock,
        });
        if (inventory.quantity >= item.quantity) {
          await inventory.update({
            quantity: inventory.quantity - item.quantity 
          }, {
            transaction: t,
            lock: t.lock,
          });
        } else {
          throw Error(`Out of stock for ${item.id}`);
        }
      }
    });
  }
}