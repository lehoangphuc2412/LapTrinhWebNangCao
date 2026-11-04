
import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: '',
      imgProduct: '',
      saving: false
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        const item = this.props.item;

        this.setState({
          txtID: item._id,
          txtName: item.name,
          txtPrice: String(item.price),
          cmbCategory: item.category?._id || '',
          imgProduct:
            'data:image/jpeg;base64,' + item.image
        });
      } else {
        this.resetForm();
      }
    }
  }

  resetForm() {
    this.setState((prevState) => ({
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory:
        prevState.categories.length > 0
          ? prevState.categories[0]._id
          : '',
      imgProduct: ''
    }));
  }

  render() {
    const {
      categories,
      txtID,
      txtName,
      txtPrice,
      cmbCategory,
      imgProduct,
      saving
    } = this.state;

    return (
      <div className="admin-product-detail">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="admin-product-field">
            <label htmlFor="admin-product-id">
              Product ID
            </label>

            <input
              id="admin-product-id"
              type="text"
              placeholder="Automatically generated"
              value={txtID}
              readOnly
            />
          </div>

          <div className="admin-product-field">
            <label htmlFor="admin-product-name">
              Product Name
            </label>

            <input
              id="admin-product-name"
              type="text"
              placeholder="Enter product name"
              value={txtName}
              onChange={(e) =>
                this.setState({
                  txtName: e.target.value
                })
              }
            />
          </div>

          <div className="admin-product-field">
            <label htmlFor="admin-product-price">
              Price (VNĐ)
            </label>

            <input
              id="admin-product-price"
              type="number"
              min="1"
              step="1"
              placeholder="Enter price, e.g. 3500000"
              value={txtPrice}
              onChange={(e) =>
                this.setState({
                  txtPrice: e.target.value
                })
              }
            />

            {Number(txtPrice) > 0 && (
              <small className="admin-product-price-preview">
                {Number(txtPrice).toLocaleString('vi-VN')} đ
              </small>
            )}
          </div>

          <div className="admin-product-field">
            <label htmlFor="admin-product-category">
              Category
            </label>

            <select
              id="admin-product-category"
              value={cmbCategory}
              onChange={(e) =>
                this.setState({
                  cmbCategory: e.target.value
                })
              }
            >
              {categories.length === 0 && (
                <option value="">No categories available</option>
              )}

              {categories.map((cate) => (
                <option key={cate._id} value={cate._id}>
                  {cate.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-product-field">
            <label htmlFor="admin-product-image">
              Product Image
            </label>

            <input
              id="admin-product-image"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => this.previewImage(e)}
            />

            <small>
              Choose a JPG, PNG, GIF or WebP image.
            </small>
          </div>

          <div className="admin-product-image-preview">
            {imgProduct ? (
              <img src={imgProduct} alt="Product preview" />
            ) : (
              <div className="admin-product-image-placeholder">
                <span>📷</span>
                <p>No image selected</p>
              </div>
            )}
          </div>

          <div className="admin-product-form-actions">
            <button
              type="button"
              className="admin-product-btn add"
              onClick={(e) => this.btnAddClick(e)}
              disabled={saving}
            >
              ADD NEW
            </button>

            <button
              type="button"
              className="admin-product-btn update"
              onClick={(e) => this.btnUpdateClick(e)}
              disabled={saving || !txtID}
            >
              UPDATE
            </button>

            <button
              type="button"
              className="admin-product-btn delete"
              onClick={(e) => this.btnDeleteClick(e)}
              disabled={saving || !txtID}
            >
              DELETE
            </button>
          </div>

          <button
            type="button"
            className="admin-product-reset"
            onClick={() => this.resetForm()}
            disabled={saving}
          >
            Clear form
          </button>

          {saving && (
            <p className="admin-product-saving">
              Processing your request...
            </p>
          )}
        </form>
      </div>
    );
  }

  previewImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (evt) => {
      this.setState({
        imgProduct: evt.target.result
      });
    };

    reader.onerror = () => {
      alert('Unable to read image.');
    };

    reader.readAsDataURL(file);
  }

  getProductData() {
    const name = this.state.txtName.trim();
    const price = Number(this.state.txtPrice);
    const category = this.state.cmbCategory;

    const image = this.state.imgProduct.replace(
      /^data:[^,]*;base64,/i,
      ''
    );

    if (
      !name ||
      !Number.isSafeInteger(price) ||
      price <= 0 ||
      !category ||
      !image
    ) {
      alert(
        'Please enter a valid name, price, category and image.'
      );
      return null;
    }

    return {
      name,
      price,
      category,
      image
    };
  }

  btnAddClick(e) {
    e.preventDefault();

    if (this.state.saving) return;

    const prod = this.getProductData();

    if (!prod) return;

    this.apiPostProduct(prod);
  }

  btnUpdateClick(e) {
    e.preventDefault();

    if (this.state.saving) return;

    const id = this.state.txtID;

    if (!id) {
      alert('Please select a product to update.');
      return;
    }

    const prod = this.getProductData();

    if (!prod) return;

    this.apiPutProduct(id, prod);
  }

  btnDeleteClick(e) {
    e.preventDefault();

    if (this.state.saving) return;

    const id = this.state.txtID;

    if (!id) {
      alert('Please select a product to delete.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      this.apiDeleteProduct(id);
    }
  }

  getConfig() {
    return {
      headers: {
        'x-access-token': this.context.token
      }
    };
  }

  async apiPostProduct(prod) {
    this.setState({ saving: true });

    try {
      const response = await axios.post(
        '/api/admin/products',
        prod,
        this.getConfig()
      );

      if (response.data && response.data.success !== false) {
        alert('Product added successfully!');
        this.resetForm();
        await this.apiGetProducts();
      } else {
        alert(response.data?.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Add product error:', error);
      alert(error.response?.data?.message || 'Failed to add product.');
    } finally {
      this.setState({ saving: false });
    }
  }

  async apiPutProduct(id, prod) {
    this.setState({ saving: true });

    try {
      const response = await axios.put(
        '/api/admin/products/' + id,
        prod,
        this.getConfig()
      );

      if (response.data && response.data.success !== false) {
        alert('Product updated successfully!');
        await this.apiGetProducts();
      } else {
        alert(response.data?.message || 'Failed to update product.');
      }
    } catch (error) {
      console.error('Update product error:', error);
      alert(error.response?.data?.message || 'Failed to update product.');
    } finally {
      this.setState({ saving: false });
    }
  }

  async apiDeleteProduct(id) {
    this.setState({ saving: true });

    try {
      const response = await axios.delete(
        '/api/admin/products/' + id,
        this.getConfig()
      );

      if (response.data && response.data.success !== false) {
        alert('Product deleted successfully!');
        this.resetForm();
        await this.apiGetProducts();
      } else {
        alert(response.data?.message || 'Failed to delete product.');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      alert(error.response?.data?.message || 'Failed to delete product.');
    } finally {
      this.setState({ saving: false });
    }
  }

  async apiGetProducts() {
    const page = this.props.curPage;
    const config = this.getConfig();

    try {
      let response = await axios.get(
        '/api/admin/products?page=' + page,
        config
      );

      let result = response.data;
      let targetPage = page;

      if (
        (!result.products || result.products.length === 0) &&
        page > 1
      ) {
        targetPage = page - 1;

        response = await axios.get(
          '/api/admin/products?page=' + targetPage,
          config
        );

        result = response.data;
      }

      this.props.updateProducts(
        result.products || [],
        result.noPages || 0,
        targetPage
      );
    } catch (error) {
      console.error('Refresh products error:', error);
      alert('Unable to refresh product list.');
    }
  }

  async apiGetCategories() {
    try {
      const response = await axios.get(
        '/api/admin/categories',
        this.getConfig()
      );

      const categories = Array.isArray(response.data)
        ? response.data
        : [];

      this.setState({
        categories,
        cmbCategory:
          this.props.item?.category?._id ||
          (categories.length > 0 ? categories[0]._id : '')
      });
    } catch (error) {
      console.error('Get categories error:', error);
    }
  }
}

export default ProductDetail;
