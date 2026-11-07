
import React, { Component } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';

class Myorders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      loading: true,
      refreshing: false,
      redirect: false,
      error: '',
      keyword: '',
      statusFilter: 'ALL'
    };
  }

  componentDidMount() {
    this.apiGetMyOrders();
  }

  formatPrice(price) {
    return Number(price || 0).toLocaleString('vi-VN') + ' đ';
  }

  formatDate(timestamp) {
    const date = new Date(Number(timestamp));

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleString('vi-VN');
  }

  formatOrderId(id) {
    return '#' + String(id || '').slice(-10);
  }

  getStatusClass(status) {
    switch (String(status || '').toUpperCase()) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'CANCELED':
        return 'canceled';
      default:
        return 'other';
    }
  }

  async apiGetMyOrders() {
    const token = sessionStorage.getItem('customer_token');

    let customer = null;

    try {
      const savedCustomer = sessionStorage.getItem('customer');
      customer = savedCustomer
        ? JSON.parse(savedCustomer)
        : null;
    } catch (error) {
      customer = null;
    }

    if (!token || !customer || !customer._id) {
      this.setState({
        loading: false,
        refreshing: false,
        redirect: true
      });
      return;
    }

    this.setState({
      refreshing: true,
      error: ''
    });

    try {
      const response = await axios.get(
        'http://localhost:3000/api/customer/orders/customer/' +
          customer._id,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const orders = Array.isArray(response.data)
        ? response.data
        : [];

      // Mới nhất lên trước
      orders.sort(
        (a, b) =>
          Number(b.cdate || 0) - Number(a.cdate || 0)
      );

      this.setState((prevState) => ({
        orders,
        loading: false,
        refreshing: false,
        error: '',
        order: prevState.order
          ? orders.find(
              (item) => item._id === prevState.order._id
            ) || null
          : null
      }));
    } catch (error) {
      console.error('Get my orders error:', error);

      if (error.response?.status === 401) {
        sessionStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer');

        this.setState({
          loading: false,
          refreshing: false,
          redirect: true
        });

        return;
      }

      this.setState({
        loading: false,
        refreshing: false,
        error:
          'Unable to load your orders. Please try again.'
      });
    }
  }

  selectOrder(order) {
    this.setState({
      order
    });
  }

  render() {
    const {
      orders,
      order: selectedOrder,
      loading,
      refreshing,
      redirect,
      error,
      keyword,
      statusFilter
    } = this.state;

    if (redirect) {
      return <Navigate to="/login" replace />;
    }

    const pendingCount = orders.filter(
      (item) =>
        String(item.status).toUpperCase() === 'PENDING'
    ).length;

    const approvedCount = orders.filter(
      (item) =>
        String(item.status).toUpperCase() === 'APPROVED'
    ).length;

    const canceledCount = orders.filter(
      (item) =>
        String(item.status).toUpperCase() === 'CANCELED'
    ).length;

    const filteredOrders = orders.filter((item) => {
      const searchText = [
        item._id,
        item.customer?.name,
        item.status,
        this.formatDate(item.cdate)
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = searchText.includes(
        keyword.trim().toLowerCase()
      );

      const matchStatus =
        statusFilter === 'ALL' ||
        String(item.status).toUpperCase() === statusFilter;

      return matchKeyword && matchStatus;
    });

    const statusOptions = [
      'ALL',
      'PENDING',
      'APPROVED',
      'CANCELED'
    ];

    return (
      <div className="shop-myorders-page">
        <div className="shop-myorders-container">

          {/* PAGE HEADER */}
          <div className="shop-myorders-header">
            <div className="shop-myorders-header-left">
              <div className="shop-myorders-icon">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>

              <div>
                <span className="shop-myorders-eyebrow">
                  YOUR PURCHASE HISTORY
                </span>

                <h1>My Orders</h1>

                <p>
                  Track your orders and review your purchases.
                </p>
              </div>
            </div>

            <span className="shop-myorders-count">
              {orders.length} Orders
            </span>
          </div>

          {/* STATISTICS */}
          <div className="shop-myorders-stats">
            <div className="shop-myorders-stat">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="shop-myorders-stat">
              <span>Pending</span>
              <strong className="shop-myorders-yellow">
                {pendingCount}
              </strong>
            </div>

            <div className="shop-myorders-stat">
              <span>Approved</span>
              <strong className="shop-myorders-green">
                {approvedCount}
              </strong>
            </div>

            <div className="shop-myorders-stat">
              <span>Canceled</span>
              <strong className="shop-myorders-red">
                {canceledCount}
              </strong>
            </div>
          </div>

          {/* ORDER HISTORY */}
          <section className="shop-myorders-card">
            <div className="shop-myorders-toolbar">
              <div>
                <h2>Order History</h2>
                <p>
                  All orders placed with your account
                </p>
              </div>

              <div className="shop-myorders-tools">
                <input
                  type="search"
                  placeholder="Search by order ID..."
                  value={keyword}
                  onChange={(e) =>
                    this.setState({
                      keyword: e.target.value
                    })
                  }
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    this.setState({
                      statusFilter: e.target.value
                    })
                  }
                >
                  {statusOptions.map((status) => (
                    <option
                      value={status}
                      key={status}
                    >
                      {status === 'ALL'
                        ? 'All Status'
                        : status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="shop-myorders-refresh"
                  disabled={refreshing}
                  onClick={() => this.apiGetMyOrders()}
                >
                  {refreshing ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="shop-myorders-empty">
                Loading orders...
              </div>
            ) : error ? (
              <div className="shop-myorders-empty">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => this.apiGetMyOrders()}
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="shop-myorders-empty">
                <div className="shop-myorders-empty-icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7 12 2l9 5v10l-9 5-9-5Z" />
                    <path d="m3 7 9 5 9-5M12 12v10" />
                  </svg>
                </div>

                <h3>No orders yet</h3>
                <p>
                  Start shopping to see your order history here.
                </p>

                <Link
                  to="/home"
                  className="shop-myorders-shop-link"
                >
                  Continue Shopping →
                </Link>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="shop-myorders-empty">
                No orders match your search.
              </div>
            ) : (
              <div className="shop-myorders-list">
                {filteredOrders.map((item) => {
                  const status = String(
                    item.status || 'UNKNOWN'
                  ).toUpperCase();

                  const isSelected =
                    selectedOrder?._id === item._id;

                  return (
                    <div
                      className={
                        'shop-myorders-item' +
                        (isSelected ? ' selected' : '')
                      }
                      key={item._id}
                    >
                      <div className="shop-myorders-item-top">
                        <div>
                          <span className="shop-myorders-order-label">
                            ORDER ID
                          </span>

                          <h3>
                            {this.formatOrderId(item._id)}
                          </h3>

                          <span className="shop-myorders-date">
                            {this.formatDate(item.cdate)}
                          </span>
                        </div>

                        <span
                          className={
                            'shop-myorders-status ' +
                            this.getStatusClass(status)
                          }
                        >
                          {status}
                        </span>
                      </div>

                      <div className="shop-myorders-item-bottom">
                        <div>
                          <span className="shop-myorders-total-label">
                            Order Total
                          </span>

                          <strong className="shop-myorders-price">
                            {this.formatPrice(item.total)}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="shop-myorders-view"
                          onClick={() =>
                            this.selectOrder(
                              isSelected ? null : item
                            )
                          }
                        >
                          {isSelected
                            ? 'Hide Details'
                            : 'View Details'}
                          <span>
                            {isSelected ? '↑' : '→'}
                          </span>
                        </button>
                      </div>

                      {/* ORDER DETAILS */}
                      {isSelected && (
                        <div className="shop-myorders-detail">
                          <div className="shop-myorders-detail-heading">
                            <h4>Order Details</h4>
                            <span>
                              {Array.isArray(item.items)
                                ? item.items.length
                                : 0}{' '}
                              products
                            </span>
                          </div>

                          <div className="shop-myorders-info">
                            <div>
                              <span>Customer</span>
                              <strong>
                                {item.customer?.name || 'N/A'}
                              </strong>
                            </div>

                            <div>
                              <span>Phone</span>
                              <strong>
                                {item.customer?.phone || 'N/A'}
                              </strong>
                            </div>

                            <div>
                              <span>Order Date</span>
                              <strong>
                                {this.formatDate(item.cdate)}
                              </strong>
                            </div>

                            <div>
                              <span>Order ID</span>
                              <strong className="shop-myorders-full-id">
                                {item._id}
                              </strong>
                            </div>
                          </div>

                          <div className="shop-myorders-products">
                            {(item.items || []).map(
                              (orderItem, index) => {
                                const product =
                                  orderItem.product || {};

                                const quantity = Number(
                                  orderItem.quantity || 0
                                );

                                return (
                                  <div
                                    className="shop-myorders-product"
                                    key={
                                      String(product._id || index) +
                                      '-' +
                                      index
                                    }
                                  >
                                    <div className="shop-myorders-product-image">
                                      {product.image ? (
                                        <img
                                          src={
                                            'data:image/jpeg;base64,' +
                                            product.image
                                          }
                                          alt={
                                            product.name || 'Product'
                                          }
                                        />
                                      ) : (
                                        <span>No Image</span>
                                      )}
                                    </div>

                                    <div className="shop-myorders-product-info">
                                      <h5>
                                        {product.name || 'Product'}
                                      </h5>

                                      <p>
                                        {this.formatPrice(
                                          product.price
                                        )}{' '}
                                        × {quantity}
                                      </p>
                                    </div>

                                    <strong className="shop-myorders-product-amount">
                                      {this.formatPrice(
                                        Number(product.price || 0) *
                                        quantity
                                      )}
                                    </strong>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div className="shop-myorders-detail-total">
                            <span>Total Amount</span>
                            <strong>
                              {this.formatPrice(item.total)}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="shop-myorders-bottom">
            <Link to="/home">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Myorders;
