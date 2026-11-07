
import React, { Component } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';

import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      checkingOut: false,
      paymentMethod: 'COD'
    };
  }

  // Định dạng tiền Việt Nam
  formatPrice(price) {
    return Number(price || 0).toLocaleString('vi-VN') + ' đ';
  }

  // Tăng / giảm số lượng
  changeQuantity(id, change) {
    if (this.state.checkingOut) return;

    const mycart = this.context.mycart.map((item) => {
      if (item.product._id !== id) {
        return item;
      }

      return {
        ...item,
        quantity: Math.max(
          1,
          Number(item.quantity || 1) + change
        )
      };
    });

    this.context.setMycart(mycart);
  }

  // Xóa sản phẩm
  lnkRemoveClick(id) {
    if (this.state.checkingOut) return;

    const mycart = this.context.mycart.filter(
      (item) => item.product._id !== id
    );

    this.context.setMycart(mycart);
  }

  // Kiểm tra trước khi Checkout
  lnkCheckoutClick() {
    if (this.state.checkingOut) return;

    if (this.context.mycart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const token = sessionStorage.getItem('customer_token');

    if (!token) {
      alert('Please login before checkout');
      this.setState({ redirect: '/login' });
      return;
    }

    if (window.confirm('Are you sure you want to place this order?')) {
      this.apiCheckout(token);
    }
  }

  // Gọi API Checkout - giữ nguyên Backend hiện tại
  async apiCheckout(token) {
    const items = this.context.mycart.map((item) => ({
      product: {
        _id: item.product._id
      },
      quantity: item.quantity
    }));

    this.setState({ checkingOut: true });

    try {
      const response = await axios.post(
        'http://localhost:3000/api/customer/checkout',
        {
          items: items,
            paymentMethod: this.state.paymentMethod

        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = response.data;
 
      if (result.success) {
        alert('Checkout successful!');

        // Xóa giỏ hàng sau khi đặt hàng thành công
        this.context.setMycart([]);

        // Chuyển về trang Home
        this.setState({
          redirect: '/home'
        });
      } else {
        alert(result.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);

      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.');

        sessionStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer');

        this.setState({
          redirect: '/login'
        });
      } else {
        const message =
          error.response?.data?.message ||
          'Checkout failed. Please try again.';

        alert(message);
      }
    } finally {
      this.setState({ checkingOut: false });
    }
  }

  render() {
    if (this.state.redirect) {
      return (
        <Navigate
          to={this.state.redirect}
          replace
        />
      );
    }

    const cart = this.context.mycart || [];
    const total = CartUtil.getTotal(cart);

    const itemCount = cart.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    return (
      <div className="shop-cart-page">
        <div className="shop-cart-container">

          {/* TIÊU ĐỀ */}
          <div className="shop-cart-heading">
            <div className="shop-cart-heading-main">
              <div className="shop-cart-heading-icon">
                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.5 13h12l2-9H6" />
                </svg>
              </div>

              <div>
                <span className="shop-cart-eyebrow">
                  YOUR SHOPPING BAG
                </span>

                <h1>My Shopping Cart</h1>

                <p>
                  Review your items before placing your order.
                </p>
              </div>
            </div>

            <div className="shop-cart-count">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* GIỎ HÀNG TRỐNG */}
          {cart.length === 0 ? (
            <div className="shop-cart-empty">
              <div className="shop-cart-empty-icon">
                <svg
                  width="58"
                  height="58"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.5 13h12l2-9H6" />
                </svg>
              </div>

              <h2>Your cart is empty</h2>

              <p>
                Looks like you haven't added any products yet.
              </p>

              <Link
                to="/home"
                className="shop-cart-shopping-button"
              >
                Continue Shopping →
              </Link>
            </div>
          ) : (
            <div className="shop-cart-layout">

              {/* DANH SÁCH SẢN PHẨM */}
              <div className="shop-cart-items-section">
                <div className="shop-cart-section-heading">
                  <h2>Cart Items</h2>

                  <span>
                    {cart.length} different products
                  </span>
                </div>

                <div className="shop-cart-items-list">
                  {cart.map((item) => {
                    const product = item.product;
                    const quantity = Number(item.quantity || 1);
                    const amount =
                      Number(product.price || 0) * quantity;

                    return (
                      <div
                        className="shop-cart-item"
                        key={product._id}
                      >
                        <div className="shop-cart-product-image">
                          {product.image ? (
                            <img
                              src={
                                'data:image/jpeg;base64,' +
                                product.image
                              }
                              alt={product.name}
                            />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>

                        <div className="shop-cart-product-content">

                          <div className="shop-cart-product-top">
                            <div>
                              <span className="shop-cart-category">
                                {product.category?.name || 'Product'}
                              </span>

                              <h3>{product.name}</h3>

                              <p className="shop-cart-product-id">
                                Product ID: {String(product._id).slice(-8)}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="shop-cart-remove"
                              disabled={this.state.checkingOut}
                              onClick={() =>
                                this.lnkRemoveClick(product._id)
                              }
                              title="Remove product"
                            >
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                              Remove
                            </button>
                          </div>

                          <div className="shop-cart-product-price">
                            {this.formatPrice(product.price)}
                            <span> / item</span>
                          </div>

                          <div className="shop-cart-product-bottom">
                            <div className="shop-cart-quantity">
                              <button
                                type="button"
                                onClick={() =>
                                  this.changeQuantity(
                                    product._id,
                                    -1
                                  )
                                }
                                disabled={
                                  quantity <= 1 ||
                                  this.state.checkingOut
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <span>{quantity}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  this.changeQuantity(
                                    product._id,
                                    1
                                  )
                                }
                                disabled={this.state.checkingOut}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <div className="shop-cart-item-subtotal">
                              <span>Subtotal</span>

                              <strong>
                                {this.formatPrice(amount)}
                              </strong>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to="/home"
                  className="shop-cart-continue"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* ORDER SUMMARY */}
              <div className="shop-cart-summary">
                <div className="shop-cart-summary-card">
                  <div className="shop-cart-summary-header">
                    <h2>Order Summary</h2>
                    <p>Review your purchase</p>
                  </div>

                  <div className="shop-cart-summary-content">
                    <div className="shop-cart-summary-row">
                      <span>Subtotal ({itemCount} items)</span>

                      <strong>
                        {this.formatPrice(total)}
                      </strong>
                    </div>

                    <div className="shop-cart-summary-divider" />

                    <div className="shop-cart-summary-total">
                      <span>Total</span>

                      <strong>
                        {this.formatPrice(total)}
                      </strong>
                    </div>

                    <p className="shop-cart-summary-note">
                      Final order amount will be confirmed
                      when you place your order.
                    </p>
<div style={{ margin: '20px 0' }}>
  <h3>Payment Method</h3>

  {[
    ['COD', 'Cash on Delivery (COD)'],
    ['VIETQR', 'Bank Transfer / VietQR'],
    ['MOMO', 'MoMo Wallet'],
    ['VNPAY', 'VNPay']
  ].map(([value, label]) => (
    <label
      key={value}
      style={{
        display: 'block',
        padding: '10px',
        cursor: 'pointer'
      }}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={this.state.paymentMethod === value}
        onChange={() =>
          this.setState({ paymentMethod: value })
        }
      />
      {' '}{label}
    </label>
  ))}
</div>
                    <button
                      type="button"
                      className="shop-cart-checkout"
                      disabled={this.state.checkingOut}
                      onClick={() =>
                        this.lnkCheckoutClick()
                      }
                    >
                      {this.state.checkingOut
                        ? 'PROCESSING...'
                        : 'Proceed to Checkout'}

                      {!this.state.checkingOut && (
                        <span>→</span>
                      )}
                    </button>

                    <Link
                      to="/home"
                      className="shop-cart-summary-back"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                <div className="shop-cart-help">
                  <span className="shop-cart-help-icon">✓</span>

                  <div>
                    <strong>Easy Checkout</strong>
                    <p>
                      Review your items and confirm
                      your order securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Mycart;
