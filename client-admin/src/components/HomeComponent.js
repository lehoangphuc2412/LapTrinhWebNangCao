
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Home extends Component {
  static contextType = MyContext;

  render() {
    const username = this.context.username || 'admin';

    return (
      <div className="admin-home-page">

        {/* Welcome Banner */}
        <section className="admin-home-hero">
          <div className="admin-home-hero-content">
            <span className="admin-badge">
              SHOPONLINE ADMIN PANEL
            </span>

            <h1>Welcome back, {username}! 👋</h1>

            <p>
              Manage your online store, products,
              categories and customers from one dashboard.
            </p>

            <div className="admin-hero-actions">
              <Link
                to="/admin/product"
                className="admin-primary-btn"
              >
                Manage Products
              </Link>

              <Link
                to="/admin/category"
                className="admin-secondary-btn"
              >
                Manage Categories
              </Link>
            </div>
          </div>

          <div className="admin-home-hero-box">
            <div className="admin-mini-card">
              <h4>Store Management</h4>
              <p>
                Manage your product information,
                categories and customer accounts.
              </p>
            </div>

            <div className="admin-mini-card">
              <h4>Quick Navigation</h4>
              <p>
                Use the navigation menu to access
                different management features.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard Cards */}
        <div className="admin-dashboard-grid">

          <div className="admin-dashboard-card">
            <div className="admin-card-icon">📦</div>
            <h3>Products</h3>
            <p>
              Manage product information, prices,
              images and categories.
            </p>

            <Link to="/admin/product">
              Manage Products
            </Link>
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-card-icon">🗂️</div>
            <h3>Categories</h3>
            <p>
              Create, update and organize
              product categories.
            </p>

            <Link to="/admin/category">
              Manage Categories
            </Link>
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-card-icon">🧾</div>
            <h3>Orders</h3>
            <p>
              Order management will be available
              after its page is implemented.
            </p>

            <span className="admin-home-coming-soon">
              Coming Soon
            </span>
          </div>

          <div className="admin-dashboard-card">
            <div className="admin-card-icon">👥</div>
            <h3>Customers</h3>
            <p>
              View and search registered
              customer accounts.
            </p>

            <Link to="/admin/customer">
              View Customers
            </Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Home;
