import React, { Component, Fragment } from 'react'

import Stats from './Stats.js'
import Header from './Header.js'

import './App.css';


class App extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <Stats />
      </Fragment>
    )
  }
}

export default App;
