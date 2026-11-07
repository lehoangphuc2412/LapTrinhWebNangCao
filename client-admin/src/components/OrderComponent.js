
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
      updatingId: null,
      error: '',
      message: '',
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

  // GET - Lấy danh sách đơn hàng
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
        error: 'Cannot load orders. Please check Admin API.'
      });
    }
  }

  // PUT - Duyệt hoặc hủy đơn hàng
  async apiUpdateStatus(orderId, newStatus) {
    if (this.state.updatingId) return;

    if (!['APPROVED', 'CANCELED'].includes(newStatus)) {
      return;
    }

    const action =
      newStatus === 'APPROVED' ? 'approve' : 'cancel';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this order?`
    );

    if (!confirmed) return;

    this.setState({
      updatingId: orderId,
      message: ''
    });

    try {
      const response = await axios.put(
        `/api/admin/orders/status/${orderId}`,
        {
          status: newStatus
        },
        {
          headers: {
            'x-access-token': this.context.token
          }
        }
      );

      if (response.data.success) {
        this.setState({
          message: `Order ${newStatus.toLowerCase()} successfully!`
        });

        // Lấy lại dữ liệu thật từ MongoDB
        await this.apiGetOrders();
      } else {
        alert(
          response.data.message ||
          'Unable to update order status.'
        );
      }
    } catch (error) {
      console.error('Update order status error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to update order status.'
      );

      // Đồng bộ lại nếu trạng thái đã bị thay đổi
      await this.apiGetOrders();
    } finally {
      this.setState({
        updatingId: null
      });
    }
  }

  // Nút APPROVE / CANCEL
  renderStatusActions(order) {
    const status = String(
      order.status || ''
    ).toUpperCase();

    if (status !== 'PENDING') {
      return (
        <span className="admin-order-processed">
          Processed
        </span>
      );
    }

    const busy = this.state.updatingId !== null;

    return (
      <div className="admin-order-action-buttons">
        <button
          type="button"
          className="admin-order-approve"
          disabled={busy}
          onClick={() =>
            this.apiUpdateStatus(order._id, 'APPROVED')
          }
        >
          {this.state.updatingId === order._id
            ? 'Processing...'
            : 'Approve'}
        </button>

        <button
          type="button"
          className="admin-order-cancel"
          disabled={busy}
          onClick={() =>
            this.apiUpdateStatus(order._id, 'CANCELED')
          }
        >
          Cancel
        </button>
      </div>
    );
  }

  render() {
    const {
      orders,
      selectedOrder,
      loading,
      error,
      message,
      keyword,
      statusFilter
    } = this.state;

    const pendingCount = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === 'PENDING'
    ).length;

    const approvedCount = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === 'APPROVED'
    ).length;

    const canceledCount = orders.filter(
      (order) =>
        String(order.status).toUpperCase() === 'CANCELED'
    ).length;

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

        {/* PAGE HEADING */}
        <div className="admin-order-heading">
          <span className="admin-order-label">
            SHOPONLINE ADMIN
          </span>

          <h1>Order Management</h1>

          <p>
            Manage customer orders, approve or cancel requests.
          </p>
        </div>

        {/* STATISTICS */}
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
            <span>Approved</span>
            <strong>{approvedCount}</strong>
          </div>

          <div className="admin-order-stat">
            <span>Canceled</span>
            <strong>{canceledCount}</strong>
          </div>
        </div>

        {/* ORDER LIST */}
        <section className="admin-order-card">
          <div className="admin-order-toolbar">
            <div>
              <h2>Order List</h2>
              <p>View and manage all customer orders.</p>
            </div>

            <div className="admin-order-tools">
              <input
                type="search"
                placeholder="Search orders..."
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
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="CANCELED">Canceled</option>
              </select>

              <button
                type="button"
                onClick={() => this.apiGetOrders()}
                disabled={loading || this.state.updatingId !== null}
              >
                Refresh
              </button>
            </div>
          </div>

          {message && (
            <div className="admin-order-success-message">
              {message}
            </div>
          )}

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
                    <th>Details</th>
                    <th>Manage</th>
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

                        <td>
                          {this.formatDate(order.cdate)}
                        </td>

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
                                : status === 'APPROVED'
                                  ? 'approved'
                                  : status === 'CANCELED'
                                    ? 'canceled'
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

                        <td>
                          {this.renderStatusActions(order)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ORDER DETAILS */}
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
                  this.setState({
                    selectedOrder: null
                  })
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
                <strong>Date:</strong>{' '}
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

            {this.renderStatusActions(selectedOrder)}
          </section>
        )}
      </div>
    );
  }
}

export default Order;
