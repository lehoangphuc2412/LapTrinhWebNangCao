
import React, { Component } from 'react';
import axios from 'axios';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      token: ''
    };
  }

  render() {
    return (
      <div className="align-center">
        <h2>ACTIVE ACCOUNT</h2>

        <form onSubmit={(e) => this.btnActiveClick(e)}>
          <table className="form">
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.id}
                    onChange={(e) =>
                      this.setState({ id: e.target.value })
                    }
                    required
                  />
                </td>
              </tr>

              <tr>
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.token}
                    onChange={(e) =>
                      this.setState({ token: e.target.value })
                    }
                    required
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input type="submit" value="ACTIVE" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  async btnActiveClick(e) {
    e.preventDefault();

    const data = {
      id: this.state.id.trim(),
      token: this.state.token.trim()
    };

    try {
      const response = await axios.post(
        'http://localhost:3000/api/customer/active',
        data
      );

      const result = response.data;
      alert(result.message);

      if (result.success) {
        this.setState({
          id: '',
          token: ''
        });
      }
    } catch (error) {
      console.error('Activation error:', error);
      alert('Activation failed. Please try again.');
    }
  }
}

export default Active;
