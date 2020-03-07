import React, { Component } from "react";
import Header from '../../common/Header'

class Home extends Component {
    render() {
        return (
            <div>
                <Header baseUrl={this.props.baseUrl} ></Header>
            </div>
        )
    }
}

export default Home;