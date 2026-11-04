
import React, { Component } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

class Myorders extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      loading: true,
      redirect: false
    };
  }

  // Định dạng giá tiền Việt Nam
  formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + ' đ';
  }

  componentDidMount() {
    this.apiGetMyOrders();
  }

  async apiGetMyOrders() {
    const token = sessionStorage.getItem('customer_token');

    let customer = null;

    try {
      const savedCustomer = sessionStorage.getItem('customer');
      customer = savedCustomer ? JSON.parse(savedCustomer) : null;
    } catch (error) {
      customer = null;
    }

    if (!token || !customer || !customer._id) {
      this.setState({
        loading: false,
        redirect: true
      });
      return;
    }

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

      this.setState({
        orders: Array.isArray(response.data)
          ? response.data
          : [],
        loading: false
      });
    } catch (error) {
      console.error('Get my orders error:', error);

      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer');

        alert('Session expired. Please login again.');

        this.setState({
          loading: false,
          redirect: true
        });
      } else {
        alert('Failed to load orders.');

        this.setState({
          loading: false
        });
      }
    }
  }

  trItemClick(item) {
    this.setState({
      order: item
    });
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/login" replace />;
    }

    if (this.state.loading) {
      return (
        <div className="align-center">
          <p>Loading orders...</p>
        </div>
      );
    }

    const orders = this.state.orders.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trItemClick(item)}
        style={{ cursor: 'pointer' }}
      >
        <td>{item._id}</td>

        <td>
          {new Date(item.cdate).toLocaleString('vi-VN')}
        </td>

        <td>{item.customer.name}</td>

        <td>{item.customer.phone}</td>

        <td>{this.formatPrice(item.total)}</td>

        <td>{item.status}</td>
      </tr>
    ));

    const selectedOrder = this.state.order;

    return (
      <div className="shop-orders-page">

        {/* DANH SÁCH ĐƠN HÀNG */}
        <div className="align-center">
          <h2 className="text-center">ORDER LIST</h2>

          <div style={{ overflowX: 'auto' }}>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>

                {orders}
              </tbody>
            </table>
          </div>

          {this.state.orders.length === 0 && (
            <p>You have no orders yet.</p>
          )}
        </div>

        {/* CHI TIẾT ĐƠN HÀNG */}
        {selectedOrder && (
          <div
            className="align-center"
            style={{ marginTop: '40px' }}
          >
            <h2 className="text-center">
              ORDER DETAIL
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table className="datatable" border="1">
                <tbody>
                  <tr className="datatable">
                    <th>No.</th>
                    <th>Prod. ID</th>
                    <th>Prod. name</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>

                  {selectedOrder.items.map((item, index) => (
                    <tr
                      key={item.product._id + '-' + index}
                      className="datatable"
                    >
                      <td>{index + 1}</td>

                      <td>{item.product._id}</td>

                      <td>{item.product.name}</td>

                      <td>
                        <img
                          src={
                            'data:image/jpg;base64,' +
                            item.product.image
                          }
                          width="70px"
                          height="70px"
                          alt={item.product.name}
                          style={{ objectFit: 'contain' }}
                        />
                      </td>

                      <td>
                        {this.formatPrice(item.product.price)}
                      </td>

                      <td>{item.quantity}</td>

                      <td>
                        {this.formatPrice(
                          item.product.price * item.quantity
                        )}
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td colSpan="5"></td>
                    <td>
                      <b>Total</b>
                    </td>
                    <td>
                      <b>
                        {this.formatPrice(selectedOrder.total)}
                      </b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Myorders;
