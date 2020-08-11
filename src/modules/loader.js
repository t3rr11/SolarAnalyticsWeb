import React, { Component } from 'react';

export class Loader extends Component {

  render() {
    return (
      <div className="loaderBG">
        <div className="loader">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="loaderText">
          <p> { this.props.statusText } </p>
        </div>
      </div>
    );
  }
}

export default Loader;
