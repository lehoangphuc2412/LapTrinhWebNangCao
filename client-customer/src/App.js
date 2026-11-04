
import './App.css';
import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MyProvider from './contexts/MyProvider';
import Main from './components/MainComponent';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <MyProvider>
          <Main />
        </MyProvider>
      </BrowserRouter>
    );
  }
}

export default App;
