
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      itemSelected: null,
      loading: true,
      error: ''
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  render() {
    const { categories, itemSelected, loading, error } = this.state;

    return (
      <div className="admin-category-page">

        {/* Tiêu đề trang */}
        <div className="admin-category-heading">
          <div>
            <span className="admin-category-label">
              SHOPONLINE ADMIN
            </span>

            <h1>Category Management</h1>

            <p>
              Manage and organize your product categories.
            </p>
          </div>

          <div className="admin-category-count">
            <strong>{categories.length}</strong>
            <span>Categories</span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="admin-category-layout">

          {/* Danh sách danh mục */}
          <section className="admin-category-card">
            <div className="admin-category-card-header">
              <div>
                <h2>Category List</h2>
                <p>Select a category to view or edit.</p>
              </div>
            </div>

            {loading ? (
              <div className="admin-category-empty">
                Loading categories...
              </div>
            ) : error ? (
              <div className="admin-category-empty">
                {error}
              </div>
            ) : categories.length === 0 ? (
              <div className="admin-category-empty">
                No categories found.
              </div>
            ) : (
              <div className="admin-category-table-wrapper">
                <table className="admin-category-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Category Name</th>
                      <th>Category ID</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((item, index) => (
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
                        <td>{index + 1}</td>

                        <td>
                          <span className="admin-category-name">
                            {item.name}
                          </span>
                        </td>

                        <td>
                          <span className="admin-category-id">
                            {item._id}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Thông tin chi tiết danh mục */}
          <section className="admin-category-card">
            <div className="admin-category-card-header">
              <div>
                <h2>Category Detail</h2>
                <p>
                  Add, update or delete a product category.
                </p>
              </div>
            </div>

            <div className="admin-category-detail-content">
              <CategoryDetail
                item={itemSelected}
                updateCategories={this.updateCategories}
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  updateCategories = (categories) => {
    this.setState((prevState) => ({
      categories: categories,
      itemSelected: prevState.itemSelected
        ? categories.find(
            (item) =>
              item._id === prevState.itemSelected._id
          ) || null
        : null
    }));
  };

  trItemClick(item) {
    this.setState({
      itemSelected: item
    });
  }

  apiGetCategories() {
    const config = {
      headers: {
        'x-access-token': this.context.token
      }
    };

    this.setState({
      loading: true,
      error: ''
    });

    axios
      .get('/api/admin/categories', config)
      .then((res) => {
        const result = res.data;

        this.setState({
          categories: Array.isArray(result) ? result : [],
          loading: false
        });
      })
      .catch((error) => {
        console.error('Get categories error:', error);

        this.setState({
          loading: false,
          error: 'Unable to load categories.'
        });
      });
  }
}

export default Category;
