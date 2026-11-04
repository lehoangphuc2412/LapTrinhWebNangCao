
require('../utils/MongooseUtil');
const Models = require('./Models');

const CustomerDAO = {
  // Tìm khách hàng theo username hoặc email
  async selectByUsernameOrEmail(username, email) {
    const query = {
      $or: [
        { username: username },
        { email: email }
      ]
    };

    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  // Thêm khách hàng mới
  async insert(customer) {
    const mongoose = require('mongoose');
    customer._id = new mongoose.Types.ObjectId();

    const result = await Models.Customer.create(customer);
    return result;
  },

  // Kích hoạt tài khoản
  async active(id, token) {
    const query = {
      _id: id,
      token: token,
      active: 0
    };

    const update = {
      active: 1
    };

    const result = await Models.Customer.findOneAndUpdate(
      query,
      update,
      { new: true }
    );

    return result;
  },

  // Đăng nhập tài khoản đã kích hoạt
  async selectByUsernameAndPassword(username, password) {
    const query = {
      username: username,
      password: password,
      active: 1
    };

    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  // Lấy thông tin khách hàng theo ID
  async selectByID(id) {
    const customer = await Models.Customer.findById(id);
    return customer;
  },

  // Cập nhật thông tin cá nhân
  async update(customer) {
    const query = {
      _id: customer._id
    };

    const update = {
      name: customer.name,
      phone: customer.phone
    };

    const result = await Models.Customer.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true }
    );

    return result;
  }
};

module.exports = CustomerDAO;
