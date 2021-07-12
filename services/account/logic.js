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
}