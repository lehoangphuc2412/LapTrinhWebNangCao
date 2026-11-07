
const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');
const EmailUtil = require('../utils/EmailUtil');

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


 // LAB 09 - ADMIN UPDATE ORDER STATUS
router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const id = req.params.id;
    const status = req.body.status;

    // Chỉ cho phép hai trạng thái trong Lab 09
    if (!['APPROVED', 'CANCELED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    // Kiểm tra ID đơn hàng
    if (!Models.Order.db.base.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Chỉ cho phép chuyển từ PENDING
    const order = await Models.Order.findOneAndUpdate(
      {
        _id: id,
        status: 'PENDING'
      },
      {
        $set: { status: status }
      },
      {
        new: true
      }
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      status: order.status
    });
  } catch (error) {
    console.error('Update order status error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to update order status'
    });
  }
});

 // LAB 09 - ADMIN DEACTIVATE CUSTOMER
router.put(
  '/customers/deactive/:id',
  JwtUtil.checkToken,
  async function (req, res) {
    try {
      const id = req.params.id;

      // Kiểm tra ID khách hàng
      if (!Models.Customer.db.base.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer ID'
        });
      }

      // Chỉ vô hiệu hóa tài khoản đang Active
      const customer = await Models.Customer.findOneAndUpdate(
        {
          _id: id,
          active: 1
        },
        {
          $set: {
            active: 0,
            token: ''
          }
        },
        {
          new: true
        }
      );

      if (!customer) {
        return res.status(409).json({
          success: false,
          message: 'Customer not found or already inactive'
        });
      }

      // Không trả về mật khẩu hoặc token
      res.json({
        success: true,
        message: 'Customer deactivated successfully',
        customer: {
          _id: customer._id,
          username: customer.username,
          name: customer.name,
          active: customer.active
        }
      });
    } catch (error) {
      console.error('Deactivate customer error:', error);

      res.status(500).json({
        success: false,
        message: 'Unable to deactivate customer'
      });
    }
  }
);

 // LAB 09 - ADMIN SEND ACTIVATION EMAIL
router.get(
  '/customers/sendmail/:id',
  JwtUtil.checkToken,
  async function (req, res) {
    try {
      const id = req.params.id;

      // Kiểm tra ID khách hàng
      if (!Models.Customer.db.base.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer ID'
        });
      }

      // Lấy thông tin cần thiết
      const customer = await Models.Customer.findById(id)
        .select('name email active token');

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Không gửi mã kích hoạt cho tài khoản đã Active
      if (Number(customer.active) === 1) {
        return res.status(400).json({
          success: false,
          message: 'Customer is already active'
        });
      }

      if (!customer.email || !customer.token) {
        return res.status(400).json({
          success: false,
          message: 'Customer has no email or activation token'
        });
      }

      // Không gửi đến email giả lập
      if (customer.email.toLowerCase().endsWith('@example.com')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send mail to a demo email address'
        });
      }

      // Dùng lại EmailUtil hiện tại
      await EmailUtil.send(
        customer.email,
        customer._id,
        customer.token
      );

      return res.json({
        success: true,
        message: 'Activation email sent successfully'
      });
    } catch (error) {
      console.error('Admin send mail error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to send activation email'
      });
    }
  }
);

module.exports = router;
