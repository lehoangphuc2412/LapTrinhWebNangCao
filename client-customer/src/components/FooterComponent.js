
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Footer extends Component {
  render() {
    return (
      <footer className="shop-footer">
        <div className="shop-footer-content">
          <div className="shop-footer-section">
            <h3>SHOPONLINE</h3>
            <p>
              Your trusted destination for quality products,
              affordable prices and convenient online shopping.
            </p>
          </div>

          <div className="shop-footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/mycart">My Cart</Link></li>
              <li><Link to="/myorders">My Orders</Link></li>
              <li><Link to="/myprofile">My Profile</Link></li>
            </ul>
          </div>

          <div className="shop-footer-section">
            <h3>Customer Support</h3>
            <p>Product Information</p>
            <p>Order Management</p>
            <p>Account Support</p>
          </div>
        </div>

        <div className="shop-footer-bottom">
          <p>
            © {new Date().getFullYear()} SHOPONLINE.
            All rights reserved.
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
