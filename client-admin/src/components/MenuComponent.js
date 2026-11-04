
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { NavLink, Link } from 'react-router-dom';

class Menu extends Component {
  static contextType = MyContext;

  render() {
    const username = this.context.username || 'admin';

    return (
      <header className="admin-topbar">
        <div className="admin-menu-brand">
          <Link to="/admin/home" className="admin-brand-link">
            <span className="admin-brand-icon">S</span>

            <span>
              SHOP<span className="admin-brand-highlight">ONLINE</span>
              <small>ADMIN PANEL</small>
            </span>
          </Link>
        </div>

        <nav className="admin-menu-left">
          <NavLink
            to="/admin/home"
            className={({ isActive }) =>
              'admin-menu-link' + (isActive ? ' active' : '')
            }
          >
            HOME
          </NavLink>

          <NavLink
            to="/admin/category"
            className={({ isActive }) =>
              'admin-menu-link' + (isActive ? ' active' : '')
            }
          >
            CATEGORY
          </NavLink>

          <NavLink
            to="/admin/product"
            className={({ isActive }) =>
              'admin-menu-link' + (isActive ? ' active' : '')
            }
          >
            PRODUCT
          </NavLink>

          <NavLink
            to="/admin/order"
            className={({ isActive }) =>
              'admin-menu-link' + (isActive ? ' active' : '')
            }
          >
            ORDER
          </NavLink>

          <NavLink
            to="/admin/customer"
            className={({ isActive }) =>
              'admin-menu-link' + (isActive ? ' active' : '')
            }
          >
            CUSTOMER
          </NavLink>
        </nav>

        <div className="admin-menu-right">
          <span className="admin-admin-name">
            Hello, <strong>{username}</strong>
          </span>

          <Link
            to="/admin/home"
            className="admin-menu-logout"
            onClick={() => this.lnkLogoutClick()}
          >
            Logout
          </Link>
        </div>
      </header>
    );
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default Menu;
