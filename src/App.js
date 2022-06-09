import React, { Component } from 'react'

import apis from './apis.js'
import './App.css';


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching: true,
    }

  }

  fetch = async () => {

    const res = await apis.getLeagueSettings();
    console.log(res.stat_categories.stats.stat)
  }


  componentDidMount() {
    this.fetch()
  }

  render() {
    return (
      <div className="App">
        <div>test</div>
      </div>

    )
  }
}

export default App;
