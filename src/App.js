import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

//Modules
import Header from './modules/header';

//Pages
import Home from './pages/home';
import Live from './pages/live';
import Faults from './pages/faults';
import Crypto from './pages/crypto';

class App extends React.Component {

  state = {
    status: {
      status: 'startUp',
      statusText: 'Getting ready!',
      error: null,
      loading: true
    },
    currentPage: "home",
    siteVersion: "1.0"
  }

  async componentDidMount() {
    this.setState({ status: { status: 'startingUp', statusText: `Loading Solar Analytics ${ this.state.siteVersion }`, loading: true } });
    this.updatePage();
    this.setState({ status: { status: 'ready', statusText: `Finished Loading App.`, loading: false } });
  }

  updatePage() {
    if(!localStorage.getItem("currentPage")) {
      var currentPage = window.location.pathname.split("/")[1];
      if(currentPage === "" || currentPage === "failed") { currentPage = "home"; }
      localStorage.setItem("currentPage", currentPage);
      this.setState({ currentPage: currentPage });
    }
    else { this.setState({ currentPage: localStorage.getItem("currentPage") }); }
  }
  setPage = (page) => {
    localStorage.setItem("currentPage", page);
    this.setState({ currentPage: page });
  }

  render () {
    return (
      <Router>
        <div className="App">
          <Header setPage={ this.setPage } currentPage={ this.state.currentPage } />
          <Switch>
            <Route exact path="/" render={ props => (<Home />) } />
            <Route path="/home" render={ props => (<Home />) } />
            <Route path="/live" render={ props => (<Live />) } />
            <Route path="/faults" render={ props => (<Faults />) } />
            <Route path="/crypto" render={ props => (<Crypto />) } />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
