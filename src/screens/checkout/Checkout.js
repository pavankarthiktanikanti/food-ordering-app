import React, { Component } from 'react';
import Header from '../../common/Header';

class Checkout extends Component {
    render() {
        return (
            <div>
                {/**
                 * the data passed in to this component can be used using
                 * this.props.location.state.cartItems
                 * this.props.location.state.restaurantID
                 */}
                <Header pageId='checkout' baseUrl={this.props.baseUrl} />
            </div>
        );
    }
}

export default Checkout;