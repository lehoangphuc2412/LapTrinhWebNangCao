
import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      showPassword: false,
      loading: false
    };
  }

  render() {
    return (
      <div className="shop-auth-page">
        <div className="shop-auth-card">

          {/* Phần tiêu đề */}
          <div className="shop-auth-header">
            <div className="shop-auth-logo">
              S
            </div>

            <h1>Welcome Back!</h1>

            <p>
              Sign in to your SHOPONLINE account
              and continue shopping.
            </p>
          </div>

          {/* Form đăng nhập */}
          <form onSubmit={(e) => this.btnLoginClick(e)}>

            <div className="shop-auth-field">
              <label htmlFor="login-username">
                Username
              </label>

              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={this.state.username}
                onChange={(e) =>
                  this.setState({
                    username: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="shop-auth-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="shop-auth-password">
                <input
                  id="login-password"
                  type={
                    this.state.showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={this.state.password}
                  onChange={(e) =>
                    this.setState({
                      password: e.target.value
                    })
                  }
                  required
                />

                <button
                  type="button"
                  className="shop-auth-show-password"
                  onClick={() =>
                    this.setState({
                      showPassword:
                        !this.state.showPassword
                    })
                  }
                >
                  {this.state.showPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="shop-auth-submit"
              disabled={this.state.loading}
            >
              {this.state.loading
                ? 'SIGNING IN...'
                : 'LOGIN'}
            </button>

          </form>

          {/* Liên kết đăng ký */}
          <div className="shop-auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup">
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    );
  }

  async btnLoginClick(e) {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    const account = {
      username: this.state.username,
      password: this.state.password
    };

    this.setState({ loading: true });

    try {
      const response = await axios.post(
        'http://localhost:3000/api/customer/login',
        account
      );

      const result = response.data;

      if (result.success) {
        sessionStorage.setItem(
          'customer_token',
          result.token
        );

        sessionStorage.setItem(
          'customer',
          JSON.stringify(result.customer)
        );

        alert('Login successful');

        this.setState({
          password: ''
        });

        window.location.href = '/home';
      } else {
        alert(result.message || 'Login failed');
      }
} catch (error) {
  console.error('Login error:', error);

  const status = error.response?.status;
  const message = error.response?.data?.message;

  console.log('HTTP Status:', status);
  console.log('Backend Message:', message);
  console.log('Request URL:', error.config?.url);

  if (!error.response) {
    alert('Cannot connect to Backend on port 3000.');
  } else {
    alert(
      `Login API Error: ${status}\n` +
      (message || 'Check the browser Console.')
    );
  }
}
    finally {
      this.setState({ loading: false });
    }
  }
}

export default Login;
