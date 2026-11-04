
import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // Dữ liệu giỏ hàng dùng chung
      mycart: [],

      // Hàm cập nhật giỏ hàng
      setMycart: this.setMycart
    };
  }

  setMycart = (value) => {
    this.setState({
      mycart: value
    });
  };

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
