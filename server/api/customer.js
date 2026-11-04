
const express = require('express');
const router = express.Router();

// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const jwt = require('jsonwebtoken');
const MyConstants = require('../utils/MyConstants');

// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

// category
router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// product
router.get('/products/new', async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
});

router.get('/products/hot', async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
});

router.get('/products/category/:cid', async function (req, res) {
  const _cid = req.params.cid;
  const products = await ProductDAO.selectByCatID(_cid);
  res.json(products);
});

router.get('/products/search/:keyword', async function (req, res) {
  const keyword = req.params.keyword;
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});

router.get('/products/:id', async function (req, res) {
  const _id = req.params.id;
  const product = await ProductDAO.selectByID(_id);
  res.json(product);
});

// customer - signup
router.post('/signup', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;

    const dbCust = await CustomerDAO.selectByUsernameOrEmail(
      username,
      email
    );

    if (dbCust) {
      return res.json({
        success: false,
        message: 'Exists username or email'
      });
    }

    const now = new Date().getTime();
    const token = CryptoUtil.md5(now.toString());

    const newCust = {
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email,
      active: 0,
      token: token
    };

    const result = await CustomerDAO.insert(newCust);

    if (!result) {
      return res.json({
        success: false,
        message: 'Insert failure'
      });
    }

    try {
      await EmailUtil.send(email, result._id, token);

      return res.json({
        success: true,
        message: 'Please check email'
      });
    } catch (emailError) {
      console.error('Email error:', emailError.message);

      return res.json({
        success: false,
        message: 'Email failure'
      });
    }
  } catch (err) {
    console.error('Signup error:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Signup failure'
    });
  }
});

// customer - active
router.post('/active', async function (req, res) {
  const id = req.body.id;
  const token = req.body.token;

  try {
    const result = await CustomerDAO.active(id, token);

    if (result) {
      res.json({
        success: true,
        message: 'Account activated successfully'
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid id or token'
      });
    }
  } catch (err) {
    res.json({
      success: false,
      message: 'Activation failure'
    });
  }
});

// customer - login
router.post('/login', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const customer =
      await CustomerDAO.selectByUsernameAndPassword(
        username,
        password
      );

    if (customer) {
      const token = jwt.sign(
        { id: customer._id },
        MyConstants.JWT_SECRET,
        { expiresIn: MyConstants.JWT_EXPIRES }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        customer: {
          _id: customer._id,
          username: customer.username,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failure'
    });
  }
});

// middleware - kiểm tra JWT
async function verifyCustomerToken(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing authentication token'
    });
  }

  const token = authorization.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      MyConstants.JWT_SECRET
    );

    const customer = await CustomerDAO.selectByID(decoded.id);

    if (!customer || customer.active !== 1) {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer account'
      });
    }

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// customer - xem thông tin cá nhân
router.get('/myprofile', verifyCustomerToken, function (req, res) {
  const customer = req.customer;

  res.json({
    success: true,
    customer: {
      _id: customer._id,
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    }
  });
});

// customer - cập nhật thông tin cá nhân
router.put('/myprofile', verifyCustomerToken, async function (req, res) {
  try {
    const name = req.body.name;
    const phone = req.body.phone;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof phone !== 'string' ||
      !phone.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    const updatedCustomer = await CustomerDAO.update({
      _id: req.customer._id,
      name: name.trim(),
      phone: phone.trim()
    });

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        _id: updatedCustomer._id,
        username: updatedCustomer.username,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        email: updatedCustomer.email
      }
    });
  } catch (err) {
    console.error('Update profile error:', err.message);

    res.status(500).json({
      success: false,
      message: 'Update profile failure'
    });
  }
});

// Lab 07 - Checkout
router.post('/checkout', verifyCustomerToken, async function (req, res) {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const id = item?.product?._id;
      const quantity = Number(item?.quantity);

      if (
        !id ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity'
        });
      }

      // Lấy thông tin sản phẩm và giá từ MongoDB
      const product = await ProductDAO.selectByID(id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }

      orderItems.push({
        product: product,
        quantity: quantity
      });

      total += product.price * quantity;
    }

    // Xác định khách hàng từ JWT
    const customer = {
      _id: req.customer._id,
      username: req.customer.username,
      name: req.customer.name,
      phone: req.customer.phone,
      email: req.customer.email
    };

    const order = {
      cdate: new Date().getTime(),
      total: total,
      status: 'PENDING',
      customer: customer,
      items: orderItems
    };

    const result = await OrderDAO.insert(order);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: 'Checkout failure'
      });
    }

    return res.json({
      success: true,
      message: 'Checkout successful',
      order: result
    });
  } catch (err) {
    console.error('Checkout error:', err.message);

    return res.status(500).json({
      success: false,
      message: 'Checkout failure'
    });
  }
});

// Lab 07 - My Orders
router.get(
  '/orders/customer/:cid',
  verifyCustomerToken,
  async function (req, res) {
    try {
      const cid = req.params.cid;
      const loggedInCustomerID = req.customer._id.toString();

      // Khách hàng chỉ được xem đơn hàng của chính mình
      if (cid !== loggedInCustomerID) {
        return res.status(403).json({
          success: false,
          message: 'You cannot view another customer orders'
        });
      }

      const orders = await OrderDAO.selectByCustID(
        loggedInCustomerID
      );

      return res.json(orders);
    } catch (err) {
      console.error('My Orders error:', err.message);

      return res.status(500).json({
        success: false,
        message: 'Get orders failure'
      });
    }
  }
);

module.exports = router;
