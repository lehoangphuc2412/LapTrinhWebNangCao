
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter.js';

class Product extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: [],
      loading: true,
      error: ''
    };

    this.requestId = 0;
  }

  render() {
    const { products, loading, error } = this.state;
    const params = this.props.params;

    const isSearch = Boolean(params.keyword);
    const title = isSearch ? 'SEARCH RESULTS' : 'OUR PRODUCTS';

    const prods = products.map((item) => (
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
            to={'/product/' + item._id}
            className="shop-product-button"
          >
            View Details
          </Link>
        </div>
      </div>
    ));

    return (
      <div className="shop-product-page">
        <div className="shop-section-heading">
          <h2>{title}</h2>

          {isSearch ? (
            <p>
              Search results for: <b>{params.keyword}</b>
            </p>
          ) : (
            <p>Explore our collection of products</p>
          )}
        </div>

        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : error ? (
          <p className="text-center">{error}</p>
        ) : products.length > 0 ? (
          <>
            <p className="shop-product-count">
              Showing {products.length} products
            </p>

            <div className="shop-product-grid">
              {prods}
            </div>
          </>
        ) : (
          <div className="shop-empty-products">
            <h3>No products found</h3>
            <p>
              There are currently no products matching your request.
            </p>

            <Link to="/home" className="shop-product-button">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    );
  }

  componentDidMount() {
    this.loadProducts();
  }

  componentDidUpdate(prevProps) {
    const oldParams = prevProps.params;
    const newParams = this.props.params;

    if (
      oldParams.cid !== newParams.cid ||
      oldParams.keyword !== newParams.keyword
    ) {
      this.loadProducts();
    }
  }

  componentWillUnmount() {
    this.requestId += 1;
  }

  loadProducts() {
    const params = this.props.params;

    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    } else {
      this.setState({
        products: [],
        loading: false,
        error: ''
      });
    }
  }

  apiGetProductsByCatID(cid) {
    const currentRequest = ++this.requestId;

    this.setState({
      products: [],
      loading: true,
      error: ''
    });

    axios
      .get(
        '/api/customer/products/category/' +
          encodeURIComponent(cid)
      )
      .then((res) => {
        if (currentRequest !== this.requestId) return;

        this.setState({
          products: res.data,
          loading: false
        });
      })
      .catch((error) => {
        if (currentRequest !== this.requestId) return;

        console.error('Get products by category error:', error);

        this.setState({
          products: [],
          loading: false,
          error: 'Unable to load products. Please try again.'
        });
      });
  }

  apiGetProductsByKeyword(keyword) {
    const currentRequest = ++this.requestId;

    this.setState({
      products: [],
      loading: true,
      error: ''
    });

    axios
      .get(
        '/api/customer/products/search/' +
          encodeURIComponent(keyword)
      )
      .then((res) => {
        if (currentRequest !== this.requestId) return;

        this.setState({
          products: res.data,
          loading: false
        });
      })
      .catch((error) => {
        if (currentRequest !== this.requestId) return;

        console.error('Search products error:', error);

        this.setState({
          products: [],
          loading: false,
          error: 'Unable to search products. Please try again.'
        });
      });
  }
}

export default withRouter(Product);
