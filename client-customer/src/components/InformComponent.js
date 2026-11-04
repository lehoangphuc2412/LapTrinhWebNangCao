
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Inform extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      customer: this.getCustomer()
    };
  }

  getCustomer() {
    try {
      const data = sessionStorage.getItem('customer');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  btnLogoutClick() {
    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer');

    // Xóa giỏ hàng khi đăng xuất
    this.context.setMycart([]);

    this.setState({
      customer: null
    });

    window.location.href = '/home';
  }

  render() {
    const customer = this.state.customer;
    const mycart = this.context.mycart;

    return (
      <div className="border-bottom">
        <div className="float-left">
          {customer ? (
            <>
              Hello, <b>{customer.name}</b> |{' '}
              <Link to="/myprofile">My Profile</Link> |{' '}
              <Link to="/myorders">My Orders</Link> |{' '}
              <Link
                to="/home"
                onClick={() => this.btnLogoutClick()}
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link> |{' '}
              <Link to="/signup">Sign-up</Link> |{' '}
              <Link to="/active">Active</Link>
            </>
          )}
        </div>

        <div className="float-right">
          <Link to="/mycart">My cart</Link> have{' '}
          <b>{mycart.length}</b> items
        </div>

        <div className="float-clear" />
      </div>
    );
  }
}

export default Inform;
