
require('../utils/MongooseUtil');
const Models = require('./Models');

const OrderDAO = {
  // Thêm đơn hàng mới vào MongoDB
  async insert(order) {
    const mongoose = require('mongoose');

    order._id = new mongoose.Types.ObjectId();

    const result = await Models.Order.create(order);

    return result;
  },

  // Lab 07 - Lấy danh sách đơn hàng theo ID khách hàng
  async selectByCustID(cid) {
    const query = {
      'customer._id': cid
    };

    const orders = await Models.Order.find(query).exec();

    return orders;
  }
};

module.exports = OrderDAO;
