
import React, { Component } from 'react';
import Menu from './MenuComponent';
import Inform from './InformComponent';
import Footer from './FooterComponent';

import Home from './HomeComponent';
import Product from './ProductComponent';
import ProductDetail from './ProductDetailComponent';
import Signup from './SignupComponent';
import Active from './ActiveComponent';
import Login from './LoginComponent';
import Myprofile from './MyprofileComponent';
import Mycart from './MycartComponent';
import Myorders from './MyordersComponent';

import { Routes, Route, Navigate } from 'react-router-dom';

class Main extends Component {
  render() {
    return (
      <div className="body-customer">
        {/* HEADER */}
        <Menu />

        {/* THÔNG TIN TÀI KHOẢN VÀ GIỎ HÀNG */}
        <Inform />

        {/* NỘI DUNG CHÍNH */}
        <main className="shop-main-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate replace to="/home" />}
            />

            <Route path="/home" element={<Home />} />

            <Route
              path="/product/category/:cid"
              element={<Product />}
            />

            <Route
              path="/product/search/:keyword"
              element={<Product />}
            />

            <Route
              path="/product/:id"
              element={<ProductDetail />}
            />

            <Route path="/signup" element={<Signup />} />
            <Route path="/active" element={<Active />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/myprofile"
              element={<Myprofile />}
            />

            <Route path="/mycart" element={<Mycart />} />
            <Route path="/myorders" element={<Myorders />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    );
  }
}

export default Main;
