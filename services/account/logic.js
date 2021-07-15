const { Customer } = require('./models');

module.exports = {
  registerCustomer: async (customer) => {
    
  },

  getCustomerProfileByEmail: async (email) => {
    return Customer.findOne({ where: { email }});
  },

  getCustomerProfileById: async (id) => {
    return Customer.findByPk(id);
  },

  deductBalanceOrFalse: async (id, amount) => {
    const t = await Customer.sequelize.transaction();
    const profile = await Customer.findByPk(id, {
      transaction: t,
      lock: t.lock,
    });
    if (profile.balance < amount) {
      await t.rollback();
      return false;
    }
    await profile.update({ balance: profile.balance - amount }, {
      transaction: t,
      lock: t.lock,
    });
    await t.commit();
    return true;
  },

  addToBalance: async (id, amount) => {
    return Customer.sequelize.transaction(async (t) => {
      const profile = await Customer.findByPk(id, {
        transaction: t,
        lock: t.lock,
      });
      return profile.update({ balance: profile.balance + amount }, {
        transaction: t,
        lock: t.lock,
      });
    });
  }
}