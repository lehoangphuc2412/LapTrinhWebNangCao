
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

import Menu from './MenuComponent';
import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';
import Customer from './CustomerComponent';
import Order from './OrderComponent';

import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  static contextType = MyContext;

  render() {
    if (this.context.token === '') {
      return null;
    }

    return (
      <div className="body-admin">
        <Menu />

        <Routes>
          <Route
            path="/admin"
            element={<Navigate to="/admin/home" replace />}
          />

          <Route
            path="/admin/home"
            element={<Home />}
          />

          <Route
            path="/admin/category"
            element={<Category />}
          />

          <Route
            path="/admin/product"
            element={<Product />}
          />

          <Route
            path="/admin/order"
            element={<Order />}
          />

          <Route
            path="/admin/customer"
            element={<Customer />}
          />

          <Route
            path="*"
            element={<Navigate to="/admin/home" replace />}
          />
        </Routes>
      </div>
    );
  }
}

export default Main;
