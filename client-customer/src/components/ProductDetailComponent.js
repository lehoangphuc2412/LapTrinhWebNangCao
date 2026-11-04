
import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter.js';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      product: null,
      txtQuantity: 1,
      loading: true,
      error: ''
    };

    this.requestId = 0;
  }

  render() {
    const {
      product,
      txtQuantity,
      loading,
      error
    } = this.state;

    if (loading) {
      return (
        <div className="shop-detail-page">
          <p className="text-center">
            Loading product details...
          </p>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="shop-detail-page">
          <div className="shop-empty-products">
            <h3>Product not found</h3>
            <p>
              {error || 'This product is not available.'}
            </p>

            <Link
              to="/home"
              className="shop-product-button"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="shop-detail-page">

        {/* Điều hướng */}
        <div className="shop-detail-breadcrumb">
          <Link to="/home">Home</Link>
          <span> / </span>
          <span>Product Details</span>
        </div>

        <div className="shop-section-heading">
          <h2>PRODUCT DETAILS</h2>
          <p>Explore product information</p>
        </div>

        <div className="shop-detail-container">

          {/* Hình ảnh sản phẩm */}
          <div className="shop-detail-image">
            <img
              src={
                'data:image/jpg;base64,' +
                product.image
              }
              alt={product.name}
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div className="shop-detail-info">

            <span className="shop-detail-label">
              {product.category?.name || 'Product'}
            </span>

            <h1>{product.name}</h1>

            <div className="shop-detail-price">
              {Number(product.price).toLocaleString('vi-VN')} đ
            </div>

            <div className="shop-detail-divider" />

            <div className="shop-detail-meta">
              <p>
                <strong>Product ID:</strong>
                <span>{product._id}</span>
              </p>

              <p>
                <strong>Category:</strong>
                <span>
                  {product.category?.name || 'N/A'}
                </span>
              </p>
            </div>

            {/* Thêm vào giỏ hàng */}
            <form
              className="shop-detail-form"
              onSubmit={(e) => this.btnAdd2CartClick(e)}
            >
              <label htmlFor="product-quantity">
                Quantity
              </label>

              <div className="shop-quantity-control">
                <button
                  type="button"
                  onClick={() => {
                    this.setState({
                      txtQuantity: Math.max(
                        1,
                        Number(txtQuantity) - 1
                      )
                    });
                  }}
                >
                  −
                </button>

                <input
                  id="product-quantity"
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  value={txtQuantity}
                  onChange={(e) => {
                    this.setState({
                      txtQuantity: e.target.value
                    });
                  }}
                  required
                />

                <button
                  type="button"
                  onClick={() => {
                    this.setState({
                      txtQuantity: Math.min(
                        99,
                        Math.max(
                          0,
                          Number(txtQuantity)
                        ) + 1
                      )
                    });
                  }}
                >
                  +
                </button>
              </div>

              <button
                type="submit"
                className="shop-detail-cart-button"
              >
                Add to Cart
              </button>
            </form>

            <div className="shop-detail-actions">
              <Link to="/mycart">
                View My Cart
              </Link>

              <Link to="/home">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetProduct(this.props.params.id);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.params.id !== this.props.params.id
    ) {
      this.setState({
        product: null,
        txtQuantity: 1,
        loading: true,
        error: ''
      });

      this.apiGetProduct(this.props.params.id);
    }
  }

  componentWillUnmount() {
    this.requestId += 1;
  }

  apiGetProduct(id) {
    const currentRequest = ++this.requestId;

    axios
      .get(
        '/api/customer/products/' +
        encodeURIComponent(id)
      )
      .then((res) => {
        if (currentRequest !== this.requestId) {
          return;
        }

        this.setState({
          product: res.data,
          loading: false,
          error: ''
        });
      })
      .catch((error) => {
        if (currentRequest !== this.requestId) {
          return;
        }

        console.error(
          'Get product error:',
          error
        );

        this.setState({
          product: null,
          loading: false,
          error: 'Unable to load product details.'
        });
      });
  }

  // Lab 07 - Thêm sản phẩm vào giỏ hàng
  btnAdd2CartClick(e) {
    e.preventDefault();

    const product = this.state.product;
    const quantity = Number(
      this.state.txtQuantity
    );

    if (!product) {
      alert('Product not found');
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      alert(
        'Please input quantity from 1 to 99'
      );
      return;
    }

    const mycart = [
      ...this.context.mycart
    ];

    const index = mycart.findIndex(
      (item) =>
        item.product._id === product._id
    );

    if (index === -1) {
      const newItem = {
        product: product,
        quantity: quantity
      };

      mycart.push(newItem);
    } else {
      const newQuantity =
        mycart[index].quantity + quantity;

      if (newQuantity > 99) {
        alert(
          'Maximum quantity is 99 per product'
        );
        return;
      }

      mycart[index] = {
        ...mycart[index],
        quantity: newQuantity
      };
    }

    this.context.setMycart(mycart);

    alert('Added to cart successfully!');
  }
}

export default withRouter(ProductDetail);
