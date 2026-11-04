
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter.js';

class Menu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      txtKeyword: ''
    };
  }

  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <li key={item._id} className="shop-nav-item">
          <Link to={'/product/category/' + item._id}>
            {item.name}
          </Link>
        </li>
      );
    });

    return (
      <header className="shop-header">
        {/* Phần trên Header */}
        <div className="shop-header-top">
          <Link to="/home" className="shop-logo">
            <span className="shop-logo-icon">S</span>
            <span>
              SHOP<span className="shop-logo-highlight">ONLINE</span>
            </span>
          </Link>

          <div className="shop-header-message">
            Quality Products • Great Prices • Easy Shopping
          </div>
        </div>

        {/* Thanh điều hướng */}
        <div className="shop-header-bottom">
          <nav className="shop-navbar">
            <ul className="shop-nav-list">
              <li className="shop-nav-item">
                <Link to="/home">HOME</Link>
              </li>

              {cates}
            </ul>
          </nav>

          {/* Tìm kiếm sản phẩm */}
          <form
            className="shop-search-form"
            onSubmit={(e) => this.btnSearchClick(e)}
          >
            <input
              type="search"
              placeholder="Search products..."
              className="shop-search-input"
              value={this.state.txtKeyword}
              onChange={(e) => {
                this.setState({
                  txtKeyword: e.target.value
                });
              }}
              required
            />

            <button type="submit" className="shop-search-button">
              SEARCH
            </button>
          </form>
        </div>
      </header>
    );
  }

  btnSearchClick(e) {
    e.preventDefault();

    const keyword = this.state.txtKeyword.trim();

    if (!keyword) {
      alert('Please enter a keyword');
      return;
    }

    this.props.navigate(
      '/product/search/' + encodeURIComponent(keyword)
    );
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories() {
    axios
      .get('/api/customer/categories')
      .then((res) => {
        this.setState({
          categories: res.data
        });
      })
      .catch((error) => {
        console.error('Get categories error:', error);
      });
  }
}

export default withRouter(Menu);
