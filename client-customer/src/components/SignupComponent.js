import React, { Component } from 'react';
import axios from 'axios';

class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      email: '',
      showPassword: false,
      loading: false,
      message: '',
      messageType: ''
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
      message: '',
      messageType: ''
    });
  };

  btnSignupClick = async (e) => {
    e.preventDefault();

    const {
      username,
      password,
      confirmPassword,
      name,
      phone,
      email
    } = this.state;

    if (password !== confirmPassword) {
      this.setState({
        message: 'Passwords do not match.',
        messageType: 'error'
      });
      return;
    }

    if (password.length < 6) {
      this.setState({
        message: 'Password must contain at least 6 characters.',
        messageType: 'error'
      });
      return;
    }

    const cleanPhone = phone.trim();

    if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
      this.setState({
        message: 'Phone number must contain 10 or 11 digits.',
        messageType: 'error'
      });
      return;
    }

    const customer = {
      username: username.trim(),
      password,
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim()
    };

    this.setState({
      loading: true,
      message: '',
      messageType: ''
    });

    try {
      const response = await axios.post(
        'http://localhost:3000/api/customer/signup',
        customer
      );

      const result = response.data;

      if (result.success) {
        this.setState({
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          phone: '',
          email: '',
          showPassword: false,
          loading: false,
          message: result.message || 'Account created successfully!',
          messageType: 'success'
        });
      } else {
        this.setState({
          loading: false,
          message: result.message || 'Signup failed.',
          messageType: 'error'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);

      this.setState({
        loading: false,
        message: 'Cannot connect to server. Please try again.',
        messageType: 'error'
      });
    }
  };

  render() {
    const {
      username,
      password,
      confirmPassword,
      name,
      phone,
      email,
      showPassword,
      loading,
      message,
      messageType
    } = this.state;

    return (
      <div className="shop-signup-page">
        <div className="shop-signup-container">

          <div className="shop-signup-intro">
            <div className="shop-signup-brand">
              <span className="shop-signup-brand-icon">S</span>
              <span>SHOPONLINE</span>
            </div>

            <div className="shop-signup-intro-content">
              <span className="shop-signup-eyebrow">
                WELCOME TO SHOPONLINE
              </span>

              <h2>
                Your shopping journey
                <br />
                starts here.
              </h2>

              <p>
                Create your account to explore our collections,
                discover great products, and enjoy a better
                shopping experience.
              </p>

              <div className="shop-signup-benefits">
                <div className="shop-signup-benefit">
                  <span className="shop-signup-check">✓</span>
                  <span>Discover our latest products</span>
                </div>

                <div className="shop-signup-benefit">
                  <span className="shop-signup-check">✓</span>
                  <span>Manage your shopping cart</span>
                </div>

                <div className="shop-signup-benefit">
                  <span className="shop-signup-check">✓</span>
                  <span>Track your orders easily</span>
                </div>
              </div>
            </div>

            <div className="shop-signup-intro-footer">
              SHOP SMART. SHOP ONLINE.
            </div>
          </div>

          <div className="shop-signup-form-side">
            <div className="shop-signup-form-header">
              <div className="shop-signup-avatar">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M19 8v6M16 11h6" />
                </svg>
              </div>

              <h1>Create an Account</h1>
              <p>
                Fill in your information to get started.
              </p>
            </div>

            <form
              className="shop-signup-form"
              onSubmit={this.btnSignupClick}
            >
              <div className="shop-signup-field">
                <label htmlFor="signup-username">
                  Username <span>*</span>
                </label>

                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={this.handleChange}
                  autoComplete="username"
                  minLength={3}
                  required
                />
              </div>

              <div className="shop-signup-row">
                <div className="shop-signup-field">
                  <label htmlFor="signup-password">
                    Password <span>*</span>
                  </label>

                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={password}
                    onChange={this.handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>

                <div className="shop-signup-field">
                  <label htmlFor="signup-confirm-password">
                    Confirm Password <span>*</span>
                  </label>

                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={this.handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <label className="shop-signup-show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) =>
                    this.setState({
                      showPassword: e.target.checked
                    })
                  }
                />
                <span>Show passwords</span>
              </label>

              <div className="shop-signup-field">
                <label htmlFor="signup-name">
                  Full Name <span>*</span>
                </label>

                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={this.handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="shop-signup-row">
                <div className="shop-signup-field">
                  <label htmlFor="signup-phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={this.handleChange}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={11}
                    required
                  />
                </div>

                <div className="shop-signup-field">
                  <label htmlFor="signup-email">
                    Email Address <span>*</span>
                  </label>

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={this.handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={
                    'shop-signup-message ' +
                    (messageType === 'success'
                      ? 'shop-signup-success'
                      : 'shop-signup-error')
                  }
                  role="status"
                >
                  {message}
                </div>
              )}

              <button
                className="shop-signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Creating account...'
                  : 'Create Account'}
                {!loading && <span>→</span>}
              </button>

              <p className="shop-signup-login-text">
                Already have an account?{' '}
                <a href="/login">Log in here</a>
              </p>
            </form>

            <p className="shop-signup-bottom-note">
              © SHOPONLINE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Signup;
