import React, { Component }  from 'react';
import Graph from '../modules/graph_gen';

export class Home extends Component {

  state = { }

  async componentDidMount() { }

  render () {
    return (
      <div className="page-content">
        <Graph />
      </div>
    )
  }
}

export default Home;
