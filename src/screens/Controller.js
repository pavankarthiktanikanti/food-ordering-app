import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Header from '../common/Header';

/**
 * Controller Component for handling the URL Paths and routing/loading respective Component
 */
class Controller extends Component {
  /**
   * Set the baseUrl to pass it on to other components in router
   */
  constructor() {
    super();
    this.baseUrl = "http://localhost:8080";
  }

  /**
   * Set the base url of food ordering backend api, centralized the url here to pass on 
   * to other components based on the request path
   */
  render() {
    return (
      <Router>
        <div className="main-container">
          <Route exact path='/' render={(props) => <Header {...props} baseUrl={this.baseUrl} />} />
        </div>
      </Router>
    )
  }
}

export default Controller;