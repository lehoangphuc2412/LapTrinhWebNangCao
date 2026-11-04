
const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');

// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');

// models
const Models = require('../models/Models');

// LOGIN
router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(
      username,
      password
    );

    if (admin) {
      const token = JwtUtil.genToken(username, password);

      res.json({
        success: true,
        message: 'Authentication successful',
        token: token
      });
    } else {
      res.json({
        success: false,
        message: 'Incorrect username or password'
      });
    }
  } else {
    res.json({
      success: false,
      message: 'Please input username and password'
    });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token =
    req.headers['x-access-token'] ||
    req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token
  });
});

// CATEGORY
router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const category = { name: name };

  const result = await CategoryDAO.insert(category);
  res.json(result);
});

router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;

  const category = {
    _id: _id,
    name: name
  };

  const result = await CategoryDAO.update(category);
  res.json(result);
});

router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;

  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

// PRODUCT
router.get('/products', JwtUtil.checkToken, async function (req, res) {
  let products = await ProductDAO.selectAll();

  const sizePage = 4;
  const noPages = Math.ceil(products.length / sizePage);

  let curPage = 1;

  if (req.query.page) {
    curPage = parseInt(req.query.page);
  }

  const offset = (curPage - 1) * sizePage;

  products = products.slice(
    offset,
    offset + sizePage
  );

  const result = {
    products: products,
    noPages: noPages,
    curPage: curPage
  };

  res.json(result);
});

router.post('/products', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;

  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    name: name,
    price: price,
    image: image,
    cdate: now,
    category: category
  };

  const result = await ProductDAO.insert(product);
  res.json(result);
});

router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;

  const category = await CategoryDAO.selectByID(cid);

  const product = {
    _id: _id,
    name: name,
    price: price,
    image: image,
    category: category
  };

  const result = await ProductDAO.update(product);
  res.json(result);
});

router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;

  const result = await ProductDAO.delete(_id);
  res.json(result);
});

// CUSTOMER - LẤY DANH SÁCH KHÁCH HÀNG
router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  try {
    const customers = await Models.Customer.find(
      {},
      {
        username: 1,
        name: 1,
        phone: 1,
        email: 1,
        active: 1
      }
    ).lean();

    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to load customers'
    });
  }
});

// ============================================
// ORDER - LẤY DANH SÁCH ĐƠN HÀNG
// ============================================
router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  try {
    const orders = await Models.Order.find({})
      .sort({ cdate: -1 })
      .lean();

    const safeOrders = orders.map((order) => ({
      _id: order._id,
      cdate: order.cdate,
      total: order.total,
      status: order.status,

      customer: {
        name: order.customer?.name || '',
        phone: order.customer?.phone || '',
        username: order.customer?.username || ''
      },

      items: (order.items || []).map((item) => ({
        quantity: item.quantity,
        product: {
          _id: item.product?._id,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          image: item.product?.image || ''
        }
      }))
    }));

    res.json(safeOrders);
  } catch (error) {
    console.error('Get admin orders error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to load orders'
    });
  }
});

module.exports = router;
