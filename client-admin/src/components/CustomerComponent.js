
import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      customers: [],
      loading: true,
      error: '',
      keyword: ''
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  async apiGetCustomers() {
    this.setState({
      loading: true,
      error: ''
    });

    try {
      const response = await axios.get(
        '/api/admin/customers',
        {
          headers: {
            'x-access-token': this.context.token
          }
        }
      );

      const result = response.data;

      const customers = Array.isArray(result)
        ? result
        : Array.isArray(result.customers)
          ? result.customers
          : [];

      this.setState({
        customers,
        loading: false
      });
    } catch (error) {
      console.error('Get customers error:', error);

      this.setState({
        loading: false,
        error: 'Cannot load customers. Please check Admin API.'
      });
    }
  }

  render() {
    const {
      customers,
      loading,
      error,
      keyword
    } = this.state;

    const filtered = customers.filter((item) => {
      const searchText = [
        item.username,
        item.name,
        item.email,
        item.phone
      ].join(' ').toLowerCase();

      return searchText.includes(keyword.toLowerCase());
    });

    return (
      <div className="admin-customer-page">
        <div className="admin-customer-heading">
          <div>
            <span className="admin-customer-label">
              SHOPONLINE ADMIN
            </span>

            <h1>Customer Management</h1>
            <p>
              View and search registered customers.
            </p>
          </div>

          <div className="admin-customer-count">
            <strong>{customers.length}</strong>
            <span>Customers</span>
          </div>
        </div>

        <section className="admin-customer-card">
          <div className="admin-customer-toolbar">
            <div>
              <h2>Customer List</h2>
              <p>Registered customer accounts</p>
            </div>

            <div className="admin-customer-tools">
              <input
                type="search"
                placeholder="Search customers..."
                value={keyword}
                onChange={(e) =>
                  this.setState({
                    keyword: e.target.value
                  })
                }
              />

              <button
                type="button"
                onClick={() => this.apiGetCustomers()}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-customer-empty">
              Loading customers...
            </div>
          ) : error ? (
            <div className="admin-customer-empty">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => this.apiGetCustomers()}
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="admin-customer-empty">
              No customers found.
            </div>
          ) : (
            <div className="admin-customer-table-wrap">
              <table className="admin-customer-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Customer</th>
                    <th>Username</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="admin-customer-identity">
                          <span className="admin-customer-avatar">
                            {(item.name || item.username || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <span className="admin-customer-name">
                            {item.name || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td>{item.username || 'N/A'}</td>
                      <td>{item.phone || 'N/A'}</td>
                      <td>{item.email || 'N/A'}</td>

                      <td>
                        <span className={
                          item.active === 1
                            ? 'admin-customer-status active'
                            : 'admin-customer-status inactive'
                        }>
                          {item.active === 1
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }
}

export default Customer;
