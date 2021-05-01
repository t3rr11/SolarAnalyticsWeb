import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Header extends Component {

  state = { }

  async componentDidMount() {

  }

  render() {    
    return (
      <header className="header">
        <div className="header-logo"><img src="/images/icons/dashboard.png" alt="logo" /></div>
        <div className="header-home-link">Solar Analytics</div>
        <div className="header-menu">
          <div className={ `header-menu-item ${ this.props.currentPage === "home" ? "active" : "" }` }>
            <img alt="home-icon" className="header-menu-item-icon" src="/images/icons/home.png" />
            <Link className="header-link" to="/home" onClick={ () => this.props.setPage("home") }>Home</Link>
            <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
          </div>
          <div className={ `header-menu-item ${ this.props.currentPage === "inverter" ? "active" : "" }` }>
            <img alt="dash-icon" className="header-menu-item-icon" src="/images/icons/dashboard.png" />
            <Link className="header-link" to="/inverter" onClick={ () => this.props.setPage("inverter") }>Inverter Info</Link>
            <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
          </div>
          <div className={ `header-menu-item ${ this.props.currentPage === "faults" ? "active" : "" }` }>
            <img alt="faults-icon" className="header-menu-item-icon" src="/images/icons/error.png" />
            <Link className="header-link" to="/faults" onClick={ () => this.props.setPage("faults") }>Faults</Link>
            <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
          </div>
          <div className={ `header-menu-item ${ this.props.currentPage === "live" ? "active" : "" }` }>
            <img alt="live-icon" className="header-menu-item-icon" src="/images/icons/red.png" />
            <Link className="header-link" to="/live" onClick={ () => this.props.setPage("live") }>Live</Link>
            <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
          </div>
          <div className={ `header-menu-item ${ this.props.currentPage === "live" ? "active" : "" }` }>
            <img alt="live-icon" className="header-menu-item-icon" src="/images/icons/dogecoin.svg" />
            <Link className="header-link" to="/crypto" onClick={ () => this.props.setPage("crypto") }>Crypto</Link>
            <img alt="arrow-icon" className="header-menu-item-arrow" src="/images/icons/arrow.png" />
          </div>
        </div>
        <div className="header-buttons">
          <div className="spacer"></div>
          <div className="header-settings-container">
            <div className="header-settings-name">Settings</div>
          </div>
        </div>
      </header>
    )
  }
}

export default Header;