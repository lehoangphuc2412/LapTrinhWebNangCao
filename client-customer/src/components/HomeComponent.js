
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newprods: [],
      hotprods: []
    };
  }

  renderProducts(products) {
    return products.map((item) => (
      <div className="shop-product-card" key={item._id}>
        <Link to={'/product/' + item._id}>
          <div className="shop-product-image">
            <img
              src={'data:image/jpg;base64,' + item.image}
              alt={item.name}
            />
          </div>
        </Link>

        <div className="shop-product-info">
          <h3>{item.name}</h3>
          <p>{Number(item.price).toLocaleString('vi-VN')} đ</p>

          <Link
            className="shop-product-button"
            to={'/product/' + item._id}
          >
            View Details
          </Link>
        </div>
      </div>
    ));
  }

  render() {
    return (
      <div className="shop-home">
        {/* Banner trang chủ */}
        <section className="shop-hero">
          <div>
            <span className="shop-hero-tag">
              WELCOME TO OUR STORE
            </span>

            <h1>Discover Your Next Favorite Product</h1>

            <p>
              Explore quality products, great prices,
              and an easy online shopping experience.
            </p>

            <Link
              className="shop-hero-button"
              to="/home"
              onClick={() => {
                document
                  .getElementById('new-products')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Sản phẩm mới */}
        <section
          id="new-products"
          className="shop-product-section"
        >
          <div className="shop-section-heading">
            <h2>NEW PRODUCTS</h2>
            <p>Check out our newest arrivals</p>
          </div>

          <div className="shop-product-grid">
            {this.renderProducts(this.state.newprods)}
          </div>
        </section>

        {/* Sản phẩm nổi bật */}
        {this.state.hotprods.length > 0 && (
          <section className="shop-product-section">
            <div className="shop-section-heading">
              <h2>HOT PRODUCTS</h2>
              <p>Discover our popular products</p>
            </div>

            <div className="shop-product-grid">
              {this.renderProducts(this.state.hotprods)}
            </div>
          </section>
        )}
      </div>
    );
  }

  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
  }

  apiGetNewProducts() {
    axios
      .get('/api/customer/products/new')
      .then((res) => {
        this.setState({
          newprods: res.data
        });
      })
      .catch((error) => {
        console.error('Get new products error:', error);
      });
  }

  apiGetHotProducts() {
    axios
      .get('/api/customer/products/hot')
      .then((res) => {
        this.setState({
          hotprods: res.data
        });
      })
      .catch((error) => {
        console.error('Get hot products error:', error);
      });
  }
}

export default Home;
