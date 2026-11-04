
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: '',
      txtPassword: '',
      showPassword: false,
      loading: false
    };
  }

  render() {
    if (this.context.token !== '') {
      return null;
    }

    return (
      <div className="admin-login-page">
        <div className="admin-login-card">

          <div className="admin-login-header">
            <div className="admin-login-logo">
              <span>S</span>
            </div>

            <div className="admin-login-brand">
              SHOP<span>ONLINE</span>
            </div>

            <h1>Admin Portal</h1>
            <p>
              Sign in to manage your online store
            </p>
          </div>

          <form onSubmit={(e) => this.btnLoginClick(e)}>

            <div className="admin-login-field">
              <label htmlFor="admin-username">
                Username
              </label>

              <input
                id="admin-username"
                type="text"
                placeholder="Enter admin username"
                autoComplete="username"
                value={this.state.txtUsername}
                onChange={(e) =>
                  this.setState({
                    txtUsername: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-password">
                <input
                  id="admin-password"
                  type={
                    this.state.showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={this.state.txtPassword}
                  onChange={(e) =>
                    this.setState({
                      txtPassword: e.target.value
                    })
                  }
                  required
                />

                <button
                  type="button"
                  className="admin-login-show"
                  onClick={() =>
                    this.setState((prevState) => ({
                      showPassword: !prevState.showPassword
                    }))
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
              className="admin-login-submit"
              disabled={this.state.loading}
            >
              {this.state.loading
                ? 'SIGNING IN...'
                : 'SIGN IN'}
            </button>
          </form>

          <div className="admin-login-footer">
            <span>🔒 Administrator access only</span>
            <p>© {new Date().getFullYear()} SHOPONLINE</p>
          </div>

        </div>
      </div>
    );
  }

  btnLoginClick(e) {
    e.preventDefault();

    if (this.state.loading) {
      return;
    }

    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (!username || !password) {
      alert('Please input username and password');
      return;
    }

    this.apiLogin({
      username: username,
      password: password
    });
  }

  async apiLogin(account) {
    this.setState({ loading: true });

    try {
      const res = await axios.post(
        '/api/admin/login',
        account
      );

      const result = res.data;

      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);

      alert(
        error.response?.data?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      this.setState({ loading: false });
    }
  }
}

export default Login;
