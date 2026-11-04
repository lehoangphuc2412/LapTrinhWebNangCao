
import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      selectedOrder: null,
      loading: true,
      error: '',
      keyword: '',
      statusFilter: 'ALL'
    };
  }

  componentDidMount() {
    this.apiGetOrders();
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

  async apiGetOrders() {
    this.setState({
      loading: true,
      error: ''
    });

    try {
      const response = await axios.get(
        '/api/admin/orders',
        {
          headers: {
            'x-access-token': this.context.token
          }
        }
      );

      const orders = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.orders)
          ? response.data.orders
          : [];

      this.setState((prevState) => ({
        orders,
        loading: false,
        selectedOrder: prevState.selectedOrder
          ? orders.find(
              (item) =>
                item._id === prevState.selectedOrder._id
            ) || null
          : null
      }));
    } catch (error) {
      console.error('Get orders error:', error);

      this.setState({
        loading: false,
        error:
          'Unable to load orders. Please check the Admin API.'
      });
    }
  }

  render() {
    const {
      orders,
      selectedOrder,
      loading,
      error,
      keyword,
      statusFilter
    } = this.state;

    const pendingCount = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === 'PENDING'
    ).length;

    const statuses = [
      ...new Set(
        orders
          .map((order) => String(order.status || '').toUpperCase())
          .filter(Boolean)
      )
    ];

    const filteredOrders = orders.filter((order) => {
      const text = [
        order._id,
        order.customer?.name,
        order.customer?.username,
        order.customer?.phone,
        order.status
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = text.includes(
        keyword.trim().toLowerCase()
      );

      const matchStatus =
        statusFilter === 'ALL' ||
        String(order.status).toUpperCase() === statusFilter;

      return matchKeyword && matchStatus;
    });

    return (
      <div className="admin-order-page">
        <div className="admin-order-heading">
          <div>
            <span className="admin-order-label">
              SHOPONLINE ADMIN
            </span>

            <h1>Order Management</h1>
            <p>
              Track customer orders and view purchase details.
            </p>
          </div>
        </div>

        <div className="admin-order-stats">
          <div className="admin-order-stat">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="admin-order-stat">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="admin-order-stat">
            <span>Other Status</span>
            <strong>{orders.length - pendingCount}</strong>
          </div>
        </div>

        <section className="admin-order-card">
          <div className="admin-order-toolbar">
            <div>
              <h2>Order List</h2>
              <p>Select an order to see its details.</p>
            </div>

            <div className="admin-order-tools">
              <input
                type="search"
                placeholder="Search orders..."
                value={keyword}
                onChange={(e) =>
                  this.setState({ keyword: e.target.value })
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
                <option value="ALL">All Status</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => this.apiGetOrders()}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-order-empty">
              Loading orders...
            </div>
          ) : error ? (
            <div className="admin-order-empty">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => this.apiGetOrders()}
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-order-empty">
              No orders found.
            </div>
          ) : (
            <div className="admin-order-table-wrap">
              <table className="admin-order-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, index) => {
                    const status = String(
                      order.status || 'UNKNOWN'
                    ).toUpperCase();

                    return (
                      <tr key={order._id}>
                        <td>{index + 1}</td>

                        <td>
                          <span className="admin-order-id">
                            {String(order._id).slice(-10)}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {order.customer?.name || 'N/A'}
                          </strong>
                          <small>
                            {order.customer?.phone || 'No phone'}
                          </small>
                        </td>

                        <td>{this.formatDate(order.cdate)}</td>

                        <td>
                          <strong className="admin-order-money">
                            {this.formatPrice(order.total)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              'admin-order-status ' +
                              (status === 'PENDING'
                                ? 'pending'
                                : 'other')
                            }
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-order-view"
                            onClick={() =>
                              this.setState({
                                selectedOrder: order
                              })
                            }
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedOrder && (
          <section className="admin-order-card admin-order-detail">
            <div className="admin-order-detail-header">
              <div>
                <h2>Order Details</h2>
                <p>Order ID: {selectedOrder._id}</p>
              </div>

              <button
                type="button"
                className="admin-order-close"
                onClick={() =>
                  this.setState({ selectedOrder: null })
                }
              >
                Close
              </button>
            </div>

            <div className="admin-order-customer-info">
              <p>
                <strong>Customer:</strong>{' '}
                {selectedOrder.customer?.name || 'N/A'}
              </p>

              <p>
                <strong>Phone:</strong>{' '}
                {selectedOrder.customer?.phone || 'N/A'}
              </p>

              <p>
                <strong>Order Date:</strong>{' '}
                {this.formatDate(selectedOrder.cdate)}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {selectedOrder.status}
              </p>
            </div>

            <div className="admin-order-table-wrap">
              <table className="admin-order-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedOrder.items || []).map(
                    (item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="admin-order-product">
                            {item.product?.image && (
                              <img
                                src={
                                  'data:image/jpeg;base64,' +
                                  item.product.image
                                }
                                alt={item.product?.name || 'Product'}
                              />
                            )}

                            <span>
                              {item.product?.name || 'N/A'}
                            </span>
                          </div>
                        </td>

                        <td>
                          {this.formatPrice(
                            item.product?.price
                          )}
                        </td>

                        <td>{item.quantity}</td>

                        <td>
                          {this.formatPrice(
                            Number(item.product?.price || 0) *
                            Number(item.quantity || 0)
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-order-total">
              <span>Order Total</span>
              <strong>
                {this.formatPrice(selectedOrder.total)}
              </strong>
            </div>
          </section>
        )}
      </div>
    );
  }
}

export default Order;
