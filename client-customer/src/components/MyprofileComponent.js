
import React, { Component } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

class Myprofile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customer: null,
      name: '',
      phone: '',
      loading: true,
      saving: false,
      redirect: false
    };
  }

  componentDidMount() {
    this.loadProfile();
  }

  async loadProfile() {
    const token = sessionStorage.getItem('customer_token');

    if (!token) {
      this.setState({
        loading: false,
        redirect: true
      });
      return;
    }

    try {
      const response = await axios.get(
        'http://localhost:3000/api/customer/myprofile',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = response.data;

      if (result.success) {
        this.setState({
          customer: result.customer,
          name: result.customer.name || '',
          phone: result.customer.phone || '',
          loading: false
        });
      } else {
        alert(result.message || 'Failed to load profile.');
        this.setState({ loading: false });
      }
    } catch (error) {
      console.error('Load profile error:', error);

      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer');

        alert('Session expired. Please login again.');

        this.setState({
          loading: false,
          redirect: true
        });
      } else {
        alert('Failed to load profile.');
        this.setState({ loading: false });
      }
    }
  }

  async btnUpdateClick(e) {
    e.preventDefault();

    if (this.state.saving) {
      return;
    }

    const token = sessionStorage.getItem('customer_token');

    if (!token) {
      this.setState({ redirect: true });
      return;
    }

    this.setState({ saving: true });

    try {
      const response = await axios.put(
        'http://localhost:3000/api/customer/myprofile',
        {
          name: this.state.name,
          phone: this.state.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = response.data;

      if (result.success) {
        sessionStorage.setItem(
          'customer',
          JSON.stringify(result.customer)
        );

        this.setState({
          customer: result.customer,
          name: result.customer.name,
          phone: result.customer.phone
        });

        alert('Profile updated successfully');

        // Cập nhật tên hiển thị ở Header
        window.location.reload();
      } else {
        alert(result.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Update profile error:', error);

      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer');

        alert('Session expired. Please login again.');

        this.setState({ redirect: true });
      } else {
        alert('Failed to update profile.');
      }
    } finally {
      this.setState({ saving: false });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/login" replace />;
    }

    if (this.state.loading) {
      return (
        <div className="shop-profile-page">
          <p className="text-center">Loading profile...</p>
        </div>
      );
    }

    if (!this.state.customer) {
      return (
        <div className="shop-profile-page">
          <p className="text-center">Unable to load profile.</p>
        </div>
      );
    }

    const customer = this.state.customer;

    return (
      <div className="shop-profile-page">
        <div className="shop-profile-card">

          {/* Tiêu đề hồ sơ */}
          <div className="shop-profile-header">
            <div className="shop-profile-avatar">
              {customer.name
                ? customer.name.charAt(0).toUpperCase()
                : 'U'}
            </div>

            <h1>My Profile</h1>

            <p>
              Manage your personal information
              and keep your account up to date.
            </p>
          </div>

          {/* Form thông tin cá nhân */}
          <form onSubmit={(e) => this.btnUpdateClick(e)}>

            <div className="shop-profile-field">
              <label htmlFor="profile-username">
                Username
              </label>

              <input
                id="profile-username"
                type="text"
                value={customer.username || ''}
                readOnly
              />

              <small>Username cannot be changed.</small>
            </div>

            <div className="shop-profile-field">
              <label htmlFor="profile-email">
                Email Address
              </label>

              <input
                id="profile-email"
                type="email"
                value={customer.email || ''}
                readOnly
              />
            </div>

            <div className="shop-profile-divider" />

            <h3 className="shop-profile-section-title">
              Personal Information
            </h3>

            <div className="shop-profile-field">
              <label htmlFor="profile-name">
                Full Name
              </label>

              <input
                id="profile-name"
                type="text"
                placeholder="Enter your full name"
                value={this.state.name}
                onChange={(e) =>
                  this.setState({
                    name: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="shop-profile-field">
              <label htmlFor="profile-phone">
                Phone Number
              </label>

              <input
                id="profile-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={this.state.phone}
                onChange={(e) =>
                  this.setState({
                    phone: e.target.value
                  })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="shop-profile-submit"
              disabled={this.state.saving}
            >
              {this.state.saving
                ? 'UPDATING...'
                : 'UPDATE PROFILE'}
            </button>
          </form>

        </div>
      </div>
    );
  }
}

export default Myprofile;
