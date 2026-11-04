
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetProducts(1);
  }

  formatPrice(price) {
    return Number(price).toLocaleString('vi-VN') + ' đ';
  }

  formatDate(date) {
    return new Date(date).toLocaleString('vi-VN');
  }

  render() {
    const {
      products,
      noPages,
      curPage,
      itemSelected,
      loading,
      error
    } = this.state;

    return (
      <div className="admin-product-page">
        <div className="admin-product-heading">
          <div>
            <span className="admin-product-label">
              SHOPONLINE ADMIN
            </span>

            <h1>Product Management</h1>

            <p>
              Manage product information, prices,
              images and categories.
            </p>
          </div>

          <div className="admin-product-page-info">
            <strong>{products.length}</strong>
            <span>Products on this page</span>
          </div>
        </div>

        <div className="admin-product-layout">
          <section className="admin-product-card">
            <div className="admin-product-card-heading">
              <h2>Product List</h2>
              <p>
                Select a product to view or update its details.
              </p>
            </div>

            {loading ? (
              <div className="admin-product-empty">
                Loading products...
              </div>
            ) : error ? (
              <div className="admin-product-empty">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="admin-product-empty">
                No products found.
              </div>
            ) : (
              <div className="admin-product-table-wrap">
                <table className="admin-product-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((item) => (
                      <tr
                        key={item._id}
                        className={
                          itemSelected?._id === item._id
                            ? 'selected'
                            : ''
                        }
                        onClick={() => this.trItemClick(item)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' ||
                            e.key === ' '
                          ) {
                            e.preventDefault();
                            this.trItemClick(item);
                          }
                        }}
                      >
                        <td>
                          <img
                            className="admin-product-thumb"
                            src={
                              'data:image/jpeg;base64,' +
                              item.image
                            }
                            alt={item.name}
                          />
                        </td>

                        <td>
                          <span className="admin-product-name">
                            {item.name}
                          </span>

                          <small className="admin-product-id">
                            ID: {item._id}
                          </small>
                        </td>

                        <td>
                          <span className="admin-product-price">
                            {this.formatPrice(item.price)}
                          </span>
                        </td>

                        <td>
                          <span className="admin-product-category">
                            {item.category?.name || 'N/A'}
                          </span>
                        </td>

                        <td className="admin-product-date">
                          {this.formatDate(item.cdate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {noPages > 1 && (
              <div className="admin-product-pagination">
                <button
                  type="button"
                  disabled={curPage === 1 || loading}
                  onClick={() => this.lnkPageClick(curPage - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: noPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      type="button"
                      key={page}
                      disabled={loading}
                      className={
                        page === curPage ? 'active' : ''
                      }
                      onClick={() => this.lnkPageClick(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={curPage === noPages || loading}
                  onClick={() => this.lnkPageClick(curPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>

          <section className="admin-product-card">
            <div className="admin-product-card-heading">
              <h2>Product Detail</h2>
              <p>
                Add a new product or edit the selected product.
              </p>
            </div>

            <ProductDetail
              item={itemSelected}
              curPage={curPage}
              updateProducts={this.updateProducts}
            />
          </section>
        </div>
      </div>
    );
  }

  updateProducts = (products, noPages, page) => {
    const list = Array.isArray(products) ? products : [];

    this.setState((prevState) => ({
      products: list,
      noPages: Number(noPages) || 0,
      curPage: page || prevState.curPage,
      itemSelected: prevState.itemSelected
        ? list.find(
            (item) => item._id === prevState.itemSelected._id
          ) || null
        : null,
      loading: false,
      error: ''
    }));
  };

  lnkPageClick(page) {
    if (page === this.state.curPage) {
      return;
    }

    this.setState({
      itemSelected: null
    });

    this.apiGetProducts(page);
  }

  trItemClick(item) {
    this.setState({
      itemSelected: item
    });
  }

  async apiGetProducts(page) {
    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    this.setState({
      loading: true,
      error: ''
    });

    try {
      const response = await axios.get(
        '/api/admin/products?page=' + page,
        config
      );

      const result = response.data;

      this.setState({
        products: Array.isArray(result.products)
          ? result.products
          : [],
        noPages: Number(result.noPages) || 0,
        curPage: Number(result.curPage) || page,
        loading: false
      });
    } catch (error) {
      console.error('Get products error:', error);

      this.setState({
        loading: false,
        error: 'Unable to load products. Please try again.'
      });
    }
  }
}

export default Product;
