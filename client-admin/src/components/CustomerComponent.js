
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
      updatingId: null,
      mailingId: null,
      error: '',
      message: '',
      keyword: ''
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  // GET - Customer list
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
        : Array.isArray(result?.customers)
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

  // PUT - Deactivate customer
  async apiDeactivateCustomer(customer) {
    if (
      this.state.loading ||
      this.state.updatingId !== null ||
      this.state.mailingId !== null
    ) {
      return;
    }

    if (Number(customer.active) !== 1) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate "${customer.name || customer.username}"?\n\n` +
      'This account will become inactive.'
    );

    if (!confirmed) return;

    this.setState({
      updatingId: customer._id,
      message: '',
      error: ''
    });

    try {
      const response = await axios.put(
        `/api/admin/customers/deactive/${customer._id}`,
        {},
        {
          headers: {
            'x-access-token': this.context.token
          }
        }
      );

      if (response.data?.success) {
        this.setState((prevState) => ({
          customers: prevState.customers.map((item) =>
            item._id === customer._id
              ? { ...item, active: 0 }
              : item
          ),
          message:
            `${customer.name || customer.username} ` +
            'has been deactivated successfully.'
        }));

        await this.apiGetCustomers();
      } else {
        alert(
          response.data?.message ||
          'Unable to deactivate customer.'
        );
      }
    } catch (error) {
      console.error('Deactivate customer error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to deactivate customer.'
      );
    } finally {
      this.setState({
        updatingId: null
      });
    }
  }

  // LAB 09 - GET Send activation mail
  async apiSendMail(customer) {
    if (
      this.state.loading ||
      this.state.mailingId !== null ||
      this.state.updatingId !== null
    ) {
      return;
    }

    if (Number(customer.active) === 1) {
      return;
    }

    const email = String(customer.email || '').trim();

    if (
      !email ||
      email.toLowerCase().endsWith('@example.com')
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Send activation email to ${email}?\n\n` +
      'An activation email will be sent to this address.'
    );

    if (!confirmed) return;

    this.setState({
      mailingId: customer._id,
      message: '',
      error: ''
    });

    try {
      const response = await axios.get(
        `/api/admin/customers/sendmail/${customer._id}`,
        {
          headers: {
            'x-access-token': this.context.token
          }
        }
      );

      if (response.data?.success) {
        this.setState({
          message: `Activation email sent to ${email}.`
        });
      } else {
        alert(
          response.data?.message ||
          'Unable to send activation email.'
        );
      }
    } catch (error) {
      console.error('Send mail error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to send activation email.'
      );
    } finally {
      this.setState({
        mailingId: null
      });
    }
  }

  render() {
    const {
      customers,
      loading,
      updatingId,
      mailingId,
      error,
      message,
      keyword
    } = this.state;

    const activeCount = customers.filter(
      (item) => Number(item.active) === 1
    ).length;

    const inactiveCount = customers.length - activeCount;

    const filtered = customers.filter((item) => {
      const searchText = [
        item.username,
        item.name,
        item.email,
        item.phone
      ]
        .join(' ')
        .toLowerCase();

      return searchText.includes(
        keyword.trim().toLowerCase()
      );
    });

    const isBusy =
      loading ||
      updatingId !== null ||
      mailingId !== null;

    return (
      <div className="admin-customer-page">
        <div className="admin-customer-heading">
          <div>
            <span className="admin-customer-label">
              SHOPONLINE ADMIN
            </span>

            <h1>Customer Management</h1>

            <p>
              View, search and manage registered customers.
            </p>
          </div>

          <div className="admin-customer-count">
            <strong>{customers.length}</strong>
            <span>Customers</span>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="admin-customer-stats">
          <div className="admin-customer-stat">
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>

          <div className="admin-customer-stat">
            <span>Active</span>
            <strong className="admin-customer-green">
              {activeCount}
            </strong>
          </div>

          <div className="admin-customer-stat">
            <span>Inactive</span>
            <strong className="admin-customer-gray">
              {inactiveCount}
            </strong>
          </div>
        </div>

        {/* CUSTOMER LIST */}
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
                disabled={isBusy}
              >
                Refresh
              </button>
            </div>
          </div>

          {message && (
            <div
              className="admin-customer-success-message"
              role="status"
            >
              {message}
            </div>
          )}

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
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => {
                    const isActive =
                      Number(item.active) === 1;

                    const email = String(
                      item.email || ''
                    ).trim();

                    const isDemoEmail =
                      email.toLowerCase().endsWith(
                        '@example.com'
                      );

                    const canSendMail =
                      !isActive &&
                      Boolean(email) &&
                      !isDemoEmail;

                    const isUpdating =
                      updatingId === item._id;

                    const isMailing =
                      mailingId === item._id;

                    return (
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

                        <td>
                          {item.username || 'N/A'}
                        </td>

                        <td>
                          {item.phone || 'N/A'}
                        </td>

                        <td>
                          {email || 'N/A'}
                        </td>

                        <td>
                          <span
                            className={
                              isActive
                                ? 'admin-customer-status active'
                                : 'admin-customer-status inactive'
                            }
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td>
                          <div className="admin-customer-actions">
                            {isActive ? (
                              <button
                                type="button"
                                className="admin-customer-deactivate"
                                disabled={isBusy}
                                onClick={() =>
                                  this.apiDeactivateCustomer(item)
                                }
                              >
                                {isUpdating
                                  ? 'Processing...'
                                  : 'Deactivate'}
                              </button>
                            ) : (
                              <span className="admin-customer-deactivated">
                                Deactivated / Inactive
                              </span>
                            )}

                            {canSendMail && (
                              <button
                                type="button"
                                className="admin-customer-sendmail"
                                disabled={isBusy}
                                onClick={() =>
                                  this.apiSendMail(item)
                                }
                              >
                                {isMailing
                                  ? 'Sending...'
                                  : 'Send Mail'}
                              </button>
                            )}

                            {!isActive && isDemoEmail && (
                              <span className="admin-customer-demo-email">
                                Demo email
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
